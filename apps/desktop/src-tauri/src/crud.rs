pub mod recipe;

pub trait Creatable {
    async fn create(
        &self,
        db: &sqlx::Pool<sqlx::Sqlite>,
        username: Option<String>,
    ) -> Result<i64, Box<dyn std::error::Error>>;
}

pub trait Readable: Sized {
    async fn read(&self, db: &sqlx::Pool<sqlx::Sqlite>)
        -> Result<Self, Box<dyn std::error::Error>>;
}

pub trait Updatable {
    async fn update(
        &self,
        db: &sqlx::Pool<sqlx::Sqlite>,
    ) -> Result<i64, Box<dyn std::error::Error>>;
}

pub trait Deletable: Sized {
    async fn delete(&self, db: &sqlx::Pool<sqlx::Sqlite>)
        -> Result<(), Box<dyn std::error::Error>>;
}
