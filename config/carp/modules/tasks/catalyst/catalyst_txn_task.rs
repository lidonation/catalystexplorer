use cml_chain::auxdata::AuxiliaryData;
use cml_core::serialization::Serialize;
use cml_crypto::chain_core::property::Transaction;
use cml_crypto::RawBytesEncoding;
use cml_multi_era::utils::{MultiEraTransactionInput, MultiEraTransactionOutput};
use cml_multi_era::MultiEraTransactionBody;
use std::collections::{BTreeSet, HashSet};

use super::super::multiera::multiera_block::MultieraBlockTask;
use crate::config::PayloadAndReadonlyConfig::PayloadAndReadonlyConfig;
use crate::dsl::database_task::BlockGlobalInfo;
use crate::dsl::task_macro::*;
use crate::era_common::{catalyst_txns_from_hashes, transactions_from_hashes};
use entity::block::Model as BlockModel;
use entity::catalyst_txn::{
    ActiveModel as CatalystTransactionActiveModel, Entity as CatalystTransaction,
    Model as CatalystTransactionModel,
};
use entity::sea_orm::{DatabaseTransaction, QueryOrder, Set};
use sea_orm::DbErr;

carp_task! {
    name CatalystTransactionTask;
    configuration PayloadAndReadonlyConfig;
    doc "Filters and adds Catalyst transactions (metadata labels 61284, 61285, 61286) to the database";
    era multiera;
    dependencies [MultieraBlockTask];
    read [multiera_block];
    write [catalyst_txs];
    should_add_task |block, _properties| {
        !block.1.is_empty() && !block.1.auxiliary_data_set().is_empty()
    };
    execute |previous_data, task| handle_catalyst_tx(
        task.db_tx,
        task.block,
        previous_data.multiera_block.as_ref().unwrap(),
        task.config.readonly,
        task.config.include_payload
    );
    merge_result |previous_data, result| {
        *previous_data.catalyst_txs = result;
    };
}

async fn handle_catalyst_tx(
    db_tx: &DatabaseTransaction,
    block: BlockInfo<'_, cml_multi_era::MultiEraBlock, BlockGlobalInfo>,
    database_block: &BlockModel,
    readonly: bool,
    include_payload: bool,
) -> Result<Vec<CatalystTransactionModel>, DbErr> {
    // Define the Catalyst metadata labels we're looking for
    let catalyst_labels: BTreeSet<u64> = BTreeSet::from([61284, 61285, 61286]);

    if readonly {
        // Get auxiliary data set for the block
        let tx_aux_data = block.1.auxiliary_data_set();

        // Filter transactions with Catalyst metadata labels
        let catalyst_tx_indices: Vec<usize> = tx_aux_data
            .iter()
            .filter(|(_, metadata)| {
                // Extract metadata based on era
                let meta = match metadata {
                    AuxiliaryData::Conway(data) => match &data.metadata {
                        None => return false,
                        Some(metadata) => metadata,
                    },
                    AuxiliaryData::Shelley(data) => &data,
                    AuxiliaryData::ShelleyMA(data) => &data.transaction_metadata,
                };

                // Check if metadata has any of our target labels
                // Fixed: Use iterator to check entries directly since keys() doesn't exist
                meta.entries
                    .iter()
                    .any(|(label, _)| catalyst_labels.contains(label))
            })
            .map(|(idx, _)| *idx as usize)
            .collect();

        // Get transaction hashes for these indices
        let catalyst_tx_hashes = catalyst_tx_indices
            .iter()
            .map(|&idx| {
                block.1.transaction_bodies()[idx]
                    .hash()
                    .to_raw_bytes()
                    .to_vec()
            })
            .collect::<Vec<_>>();

        // If no Catalyst transactions found, return early
        if catalyst_tx_hashes.is_empty() {
            return Ok(vec![]);
        }

        tracing::info!(
            "CatalystTransactionTask: Found {} Catalyst transactions in readonly mode",
            catalyst_tx_hashes.len()
        );

        let catalyst_txs = catalyst_txns_from_hashes(db_tx, catalyst_tx_hashes.as_slice()).await?;
        return Ok(catalyst_txs);
    }

    // FOR NON-READONLY MODE

    let invalid_txs: HashSet<usize> = HashSet::from_iter(
        block
            .1
            .invalid_transactions()
            .into_iter()
            .map(|index| index as usize),
    );

    // Get auxiliary data set for the block
    let tx_aux_data = block.1.auxiliary_data_set();

    // Find indices of transactions with Catalyst metadata
    let catalyst_tx_indices: HashSet<usize> = tx_aux_data
        .iter()
        .filter(|(_, metadata)| {
            // Extract metadata based on era
            let meta = match metadata {
                AuxiliaryData::Conway(data) => match &data.metadata {
                    None => return false,
                    Some(metadata) => metadata,
                },
                AuxiliaryData::Shelley(data) => &data,
                AuxiliaryData::ShelleyMA(data) => &data.transaction_metadata,
            };

            // Check if metadata has any of our target labels
            // Fixed: Use iterator to check entries directly since keys() doesn't exist
            meta.entries
                .iter()
                .any(|(label, _)| catalyst_labels.contains(label))
        })
        .map(|(idx, _)| *idx as usize)
        .collect();

    // If no Catalyst transactions found, return early
    if catalyst_tx_indices.is_empty() {
        return Ok(vec![]);
    }

    // Filter and collect only Catalyst transactions
    let txs: Vec<CatalystTransactionActiveModel> = block
        .1
        .transaction_bodies()
        .iter()
        .enumerate()
        .filter(|(idx, _)| catalyst_tx_indices.contains(idx))
        .map(|(idx, tx)| {
            // let tx_payload = if include_payload {
            //     tx.to_cbor_bytes()
            // } else {
            //     vec![]
            // };

            // Get the metadata JSON for this transaction
            let metadata_value = tx_aux_data
                .get(&(idx as u16))
                .map(|metadata| {
                    let meta = match metadata {
                        AuxiliaryData::Conway(data) => match &data.metadata {
                            None => return serde_json::Value::Null,
                            Some(metadata) => metadata,
                        },
                        AuxiliaryData::Shelley(data) => &data,
                        AuxiliaryData::ShelleyMA(data) => &data.transaction_metadata,
                    };
                    serde_json::to_value(&meta.entries).unwrap_or(serde_json::Value::Null)
                })
                .unwrap_or(serde_json::Value::Null);

            let transaction_catalyst_labels = tx_aux_data
                .get(&(idx as u16))
                .map(|metadata| {
                    let meta = match metadata {
                        AuxiliaryData::Conway(data) => match &data.metadata {
                            None => return vec![],
                            Some(metadata) => metadata,
                        },
                        AuxiliaryData::Shelley(data) => &data,
                        AuxiliaryData::ShelleyMA(data) => &data.transaction_metadata,
                    };

                    meta.entries
                        .iter()
                        .filter_map(|(label, _)| {
                            if catalyst_labels.contains(label) {
                                Some(*label)
                            } else {
                                None
                            }
                        })
                        .collect::<Vec<u64>>()
                })
                .unwrap_or_default();

            let metadata_labels_json = serde_json::to_value(&transaction_catalyst_labels).unwrap();

            CatalystTransactionActiveModel {
                hash: Set(tx.hash().to_string()),
                // hash: Set(tx.hash().to_raw_bytes().to_vec()),
                block_id: Set(database_block.id),
                tx_index: Set(idx as i32),
                metadata: Set(metadata_value),
                is_valid: Set(!invalid_txs.contains(&idx)),
                metadata_labels: Set(metadata_labels_json),
                inputs: Set(serde_json::to_value(tx.inputs()).unwrap()),
                outputs: Set(serde_json::to_value(tx.outputs()).unwrap()),
                ..Default::default()
            }
        })
        .collect();

    if !txs.is_empty() {
        tracing::info!(
            "CatalystTransactionTaskNonReadonlymode: Inserting {} Catalyst transactions",
            txs.len()
        );
        let insertions = CatalystTransaction::insert_many(txs)
            .exec_many_with_returning(db_tx)
            .await?;
        Ok(insertions)
    } else {
        Ok(vec![])
    }
}
