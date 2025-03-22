use sea_orm::{entity::prelude::*};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Deserialize, Serialize)]
#[sea_orm(table_name = "CatalystTransaction")]
pub struct Model {
    #[sea_orm(primary_key, column_type = "BigInteger")]
    pub id: i64,
    
    #[sea_orm(unique)]
    // pub hash: Vec<u8>,
    pub hash: String,
    
    pub block_id: i32,
    
    pub tx_index: i32, // index in block
    
    pub metadata: Json,
    
    pub is_valid: bool,
    
     /**
     * metadata_labels is used to store all metadata labels for the transaction
     *
     * This is used to differentiate between different types of metadata
     *
     * 61284: Catalyst voting registration
     * 61285: Catalyst voting submission
     * 61286: Catalyst voting rewards
     */
    pub metadata_labels: Json,
    
    // Store inputs as serialized JSON or binary data
    #[sea_orm(nullable)]
    pub inputs: Json,
    
    // Store outputs as serialized JSON or binary data
    #[sea_orm(nullable)]
    pub outputs: Json,
}

#[derive(Copy, Clone, Debug, DeriveRelation, EnumIter)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::block::Entity",
        from = "Column::BlockId",
        to = "super::block::Column::Id"
    )]
    Block,
}

impl Related<super::block::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Block.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}