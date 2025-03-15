use sea_schema::migration::prelude::*;

use entity::prelude::{Block, BlockColumn};
use entity::catalyst_txn::*;

pub struct Migration;

impl MigrationName for Migration {
    fn name(&self) -> &str {
        "m20250210_000022_create_catalyst_transaction_table"
    }
}

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Entity)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Column::Id)
                            .big_integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(Column::Hash)
                            .string()
                            .not_null()
                            .unique_key(),
                    )
                    // .col(
                    //     ColumnDef::new(Column::Hash)
                    //         .binary()
                    //         .not_null()
                    //         .unique_key(),
                    // )
                    .col(ColumnDef::new(Column::BlockId).integer().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-transaction-block_id")
                            .from(Entity, Column::BlockId)
                            .to(Block, BlockColumn::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .col(ColumnDef::new(Column::TxIndex).integer().not_null())
                    .col(ColumnDef::new(Column::Metadata).json().not_null())
                    .col(ColumnDef::new(Column::IsValid).boolean().not_null())
                    .col(ColumnDef::new(Column::Inputs).json())
                    .col(ColumnDef::new(Column::Outputs).json())
                    .col(ColumnDef::new(Column::MetadataLabels).json().not_null())    
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .table(Entity)
                    .name("index-catalyst-txn-block")
                    .col(Column::BlockId)
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Entity).to_owned())
            .await
    }
}
