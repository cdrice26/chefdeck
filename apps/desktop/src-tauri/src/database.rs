use sqlx::{sqlite::Sqlite, Pool};
pub mod create;
pub mod types;

pub type Db = Pool<Sqlite>;
