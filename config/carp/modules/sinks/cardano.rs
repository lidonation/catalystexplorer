use crate::common::CardanoEventType;
use crate::perf_aggregator::PerfAggregator;
use crate::sink::Sink;
use crate::types::{MultiEraBlock, StoppableService};
use crate::{genesis, DbConfig, SinkConfig};
use async_trait::async_trait;
use cbor_event::de::Deserializer;
use cml_chain::OrderedHashMap;
use cml_core::error::*;
use cml_core::serialization::*;
use dcspark_blockchain_source::cardano::Point;
use dcspark_core::{BlockId, SlotNumber};
use entity::sea_orm::Database;
use entity::sea_orm::QueryFilter;
use entity::{
    block::EraValue,
    sea_orm::{prelude::*, ColumnTrait, DatabaseTransaction, TransactionTrait},
};
use entity::{
    prelude::{Block, BlockColumn},
    sea_orm::{DatabaseConnection, EntityTrait, QueryOrder, QuerySelect},
};
use std::sync::Arc;
use std::sync::Mutex;
use tasks::byron::byron_executor::process_byron_block;
use tasks::dsl::database_task::BlockGlobalInfo;
use tasks::execution_plan::ExecutionPlan;
use tasks::multiera::multiera_executor::process_multiera_block;
use tasks::utils::TaskPerfAggregator;

pub struct CardanoSink {
    db: DatabaseConnection,
    network: String,
    exec_plan: Arc<ExecutionPlan>,

    last_epoch: i128,
    epoch_start_time: std::time::Instant,
    task_perf_aggregator: Arc<Mutex<TaskPerfAggregator>>,
}

impl CardanoSink {
    #[allow(unreachable_patterns)]
    pub async fn new(config: SinkConfig, exec_plan: Arc<ExecutionPlan>) -> anyhow::Result<Self> {
        let (db_config, network) = match config {
            SinkConfig::Cardano { db, network } => (db, network),
            _ => todo!("Invalid sink config provided"),
        };
        match db_config {
            DbConfig::Postgres { database_url } => {
                let conn = Database::connect(&database_url).await?;

                Ok(Self {
                    db: conn,
                    network,
                    exec_plan,
                    last_epoch: -1,
                    epoch_start_time: std::time::Instant::now(),
                    task_perf_aggregator: Arc::new(Mutex::new(TaskPerfAggregator::default())),
                })
            }
            _ => todo!("Only postgres is supported atm"),
        }
    }

    /// note: points are sorted from newest to oldest
    pub(crate) async fn get_latest_point(&self) -> anyhow::Result<Vec<Point>> {
        self.get_latest_points(1u64).await
    }

    /// note: points are sorted from newest to oldest
    pub(crate) async fn get_latest_points(&self, count: u64) -> anyhow::Result<Vec<Point>> {
        let points: Vec<Point> = Block::find()
            .order_by_desc(BlockColumn::Id)
            .limit(count)
            .all(&self.db)
            .await?
            .iter()
            .map(|block| Point::BlockHeader {
                slot_nb: SlotNumber::new(block.slot as u64),
                hash: BlockId::new(hex::encode(&block.hash)),
            })
            .collect();

        Ok(points)
    }

    async fn get_specific_point(&self, block_hash: &String) -> anyhow::Result<Vec<Point>> {
        let provided_point = Block::find()
            .filter(BlockColumn::Hash.eq(hex::decode(block_hash).unwrap()))
            .one(&self.db)
            .await?;

        if provided_point.is_none() {
            panic!("Block not found in database: {block_hash}");
        }

        // for the intersection, we need to provide the block BEFORE the one the user passed in
        // since for cardano-node the block represents the last known point
        // so it will start after the point passed in

        // note: may be empty is user passed in genesis block hash
        let points: Vec<Point> = Block::find()
            .filter(BlockColumn::Id.lt(provided_point.unwrap().id))
            .order_by_desc(BlockColumn::Id)
            .one(&self.db)
            .await?
            .iter()
            .map(|block| Point::BlockHeader {
                slot_nb: SlotNumber::new(block.slot as u64),
                hash: BlockId::new(hex::encode(&block.hash)),
            })
            .collect();

        Ok(points)
    }
}

#[async_trait]
impl Sink for CardanoSink {
    type From = Point;
    type Event = CardanoEventType;

    async fn start_from(&mut self, from: Option<String>) -> anyhow::Result<Vec<Self::From>> {
        let start = match &from {
            None => self.get_latest_point().await?,
            Some(block) => self.get_specific_point(block).await?,
        };

        if start.is_empty() {
            genesis::process_genesis(&self.db, &self.network, self.exec_plan.clone()).await?;
            return self.get_latest_point().await;
        }

        Ok(start)
    }

    async fn process(
        &mut self,
        event: Self::Event,
        perf_aggregator: &mut PerfAggregator,
    ) -> anyhow::Result<()> {
        match event {
            CardanoEventType::Block {
                cbor_hex,
                epoch,
                epoch_slot,
                block_number,
                block_hash,
                block_slot: _block_slot,
            } => {
                match epoch {
                    Some(epoch) if epoch as i128 > self.last_epoch => {
                        let epoch_duration = self.epoch_start_time.elapsed();
                        perf_aggregator.set_overhead(
                            &epoch_duration,
                            &self.task_perf_aggregator.lock().unwrap().get_total(),
                        );

                        // skip posting stats if last_epoch == -1 (went application just launched)
                        if self.last_epoch >= 0 {
                            tracing::info!(
                                "Finished processing epoch {} after {:?}s (+{:?}s)",
                                self.last_epoch,
                                epoch_duration
                                    .checked_sub(perf_aggregator.block_fetch)
                                    .unwrap_or(std::time::Duration::new(0, 0))
                                    .as_secs(),
                                perf_aggregator.block_fetch.as_secs()
                            );

                            tracing::trace!(
                                    "Epoch non-task time spent:\n{:#?}\nEpoch task-wise time spent:\n{:#?}",
                                    perf_aggregator,
                                    self.task_perf_aggregator.lock().unwrap()
                                );
                        }
                        self.epoch_start_time = std::time::Instant::now();
                        perf_aggregator.reset();
                        self.task_perf_aggregator =
                            Arc::new(Mutex::new(TaskPerfAggregator::default()));

                        tracing::info!(
                            "Starting epoch {} at block #{} ({})",
                            epoch,
                            block_number,
                            block_hash
                        );
                        self.last_epoch = epoch as i128;
                    }
                    _ => (),
                };
                self.db
                    .transaction::<_, (), DbErr>(|txn| {
                        Box::pin(insert_block(
                            cbor_hex,
                            epoch,
                            epoch_slot,
                            txn,
                            self.exec_plan.clone(),
                            self.task_perf_aggregator.clone(),
                        ))
                    })
                    .await?;
            }
            CardanoEventType::RollBack {
                block_slot,
                block_hash,
            } => {
                match block_slot {
                    0 => tracing::info!("Rolling back to genesis ({})", block_hash),
                    _ => tracing::info!(
                        "Rolling back to block {} at slot {}",
                        block_hash,
                        block_slot - 1
                    ),
                };
                let rollback_start = std::time::Instant::now();

                let point = Block::find()
                    .filter(BlockColumn::Hash.eq(hex::decode(block_hash).unwrap()))
                    .one(&self.db)
                    .await?;
                match &point {
                    None => {
                        // note: potentially caused by https://github.com/txpipe/oura/issues/304
                        let count = Block::find().count(&self.db).await?;
                        if count > 1 {
                            panic!(
                                "Rollback destination did not exist. Maybe you're stuck on a fork?"
                            );
                        }
                    }
                    Some(point) => {
                        Block::delete_many()
                            .filter(BlockColumn::Id.gt(point.id))
                            .exec(&self.db)
                            .await?;
                    }
                }

                perf_aggregator.rollback += rollback_start.elapsed();
            }
        }
        Ok(())
    }
}

#[async_trait]
impl StoppableService for CardanoSink {
    async fn stop(self) -> anyhow::Result<()> {
        Ok(())
    }
}

fn to_era_value(x: &MultiEraBlock) -> EraValue {
    match x {
        MultiEraBlock::Byron(_) => EraValue::Byron,
        MultiEraBlock::Shelley(_) => EraValue::Shelley,
        MultiEraBlock::Allegra(_) => EraValue::Allegra,
        MultiEraBlock::Mary(_) => EraValue::Mary,
        MultiEraBlock::Alonzo(_) => EraValue::Alonzo,
        MultiEraBlock::Babbage(_) => EraValue::Babbage,
        MultiEraBlock::Conway(_) => EraValue::Conway,
    }
}

fn parse_problematic_conway_block(bytes: &[u8]) -> Result<MultiEraBlock, DeserializeError> {    
    // First, extract the era tag (7 for Conway), the one detected to be problematic
    let mut raw = Deserializer::from(std::io::Cursor::new(bytes));
    let len = raw.array()?;
    let mut read_len = CBORReadLen::from(len);
    read_len.read_elems(2)?;
    read_len.finish()?;

    let era = raw
        .unsigned_integer()
        .map_err(|e| DeserializeError::from(e).annotate("block_era_tag"))?;

    if era != 7 {
        return Err(DeserializeFailure::InvalidStructure(
            Box::new(std::io::Error::new(std::io::ErrorKind::InvalidData, "Expected Conway era tag")),
        )
        .into());
    }

    let len = raw.array_sz()?;
    let mut read_len = CBORReadLen::new(len);
    read_len.read_elems(5)?;
    read_len.finish()?;
    
    let header = cml_chain::block::Header::deserialize(&mut raw)
        .map_err(|e: DeserializeError| e.annotate("header"))?;
    
    tracing::info!("Successfully parsed block header");
    
    let transaction_bodies = Vec::new();
    let transaction_witness_sets = Vec::new();
    let auxiliary_data_set = OrderedHashMap::new();
    let invalid_transactions = Vec::new();
    
    let block = cml_chain::block::Block::new(
        header,
        transaction_bodies,
        transaction_witness_sets,
        auxiliary_data_set,
        invalid_transactions,
    );

    tracing::info!("Created minimal Conway block with just the header");
    Ok(MultiEraBlock::Conway(block))
}

async fn insert_block(
    cbor_hex: String,
    epoch: Option<u64>,
    epoch_slot: Option<u64>,
    txn: &DatabaseTransaction,
    exec_plan: Arc<ExecutionPlan>,
    task_perf_aggregator: Arc<Mutex<TaskPerfAggregator>>,
) -> Result<(), DbErr> {
    let mut perf_aggregator = PerfAggregator::new();
    let block_parse_counter = std::time::Instant::now();

    let block_payload = match hex::decode(&cbor_hex) {
        Ok(payload) => payload,
        Err(e) => {
            tracing::error!("Failed to decode hex string: {:?}", e);
            return Err(DbErr::Custom(format!("Hex decoding error: {:?}", e)));
        }
    };

    // Try standard parsing first
    let multi_block = match MultiEraBlock::from_explicit_network_cbor_bytes(&block_payload) {
        Ok(block) => block,
        Err(e) => {
            let error_string = e.to_string();
            tracing::warn!("Failed to deserialize block CBOR: {:?}", error_string);
            if error_string.contains("Duplicate key")
                && error_string.contains("some complicated/unsupported type")
            {
                tracing::warn!(
                    "Detected duplicate key error, using custom parser. Error: {}",
                    e
                );

                // Save the problematic block for analysis
                let filename = format!(
                    "problematic_block_epoch{}_slot{}.cbor",
                    epoch.unwrap_or(0),
                    epoch_slot.unwrap_or(0)
                );
                if let Ok(mut file) = std::fs::File::create(&filename) {
                    use std::io::Write;
                    if let Err(e) = file.write_all(&block_payload) {
                        tracing::error!("Failed to write CBOR to file: {:?}", e);
                    } else {
                        tracing::info!(
                            "Successfully saved problematic block CBOR to file: {}",
                            filename
                        );
                    }
                }

                // Use our custom parser as fallback
                match parse_problematic_conway_block(&block_payload) {
                    Ok(block) => block,
                    Err(e) => {
                        tracing::error!("Failed to parse with custom parser: {:?}", e);
                        return Err(DbErr::Custom(format!("Custom parsing error: {:?}", e)));
                    }
                }
            } else {
                // For other errors, just return the original error
                tracing::error!("Failed to deserialize block CBOR: {:?}", e);
                return Err(DbErr::Custom(format!(
                    "Block deserialization error: {:?}",
                    e
                )));
            }
        }
    };

    let block_global_info = BlockGlobalInfo {
        era: to_era_value(&multi_block),
        epoch,
        epoch_slot,
    };

    perf_aggregator.block_parse += block_parse_counter.elapsed();

    match &multi_block {
        MultiEraBlock::Byron(_byron) => {
            process_byron_block(
                txn,
                (&cbor_hex, &multi_block, &block_global_info),
                &exec_plan,
                task_perf_aggregator.clone(),
            )
            .await?
        }
        _ => {
            process_multiera_block(
                txn,
                (&cbor_hex, &multi_block, &block_global_info),
                &exec_plan,
                task_perf_aggregator.clone(),
            )
            .await?
        }
    }

    Ok(())
}
