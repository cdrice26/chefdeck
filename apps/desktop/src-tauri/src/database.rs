use sqlx::{sqlite::Sqlite, Pool};
pub mod create;

pub type Db = Pool<Sqlite>;
