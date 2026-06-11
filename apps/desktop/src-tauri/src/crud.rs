mod recipe;

pub trait Creatable {
    async fn create(
        &self,
        db: &sqlx::Pool<sqlx::Sqlite>,
        username: Option<String>,
    ) -> Result<i64, Box<dyn std::error::Error>>;
}

pub trait Readable: Sized {
    async fn read(&self) -> Result<Self, Box<dyn std::error::Error>>;
}

pub trait Updatable: Sized {
    async fn update(&self) -> Result<Self, Box<dyn std::error::Error>>;
}

pub trait Deletable: Sized {
    async fn delete(&self) -> Result<(), Box<dyn std::error::Error>>;
}
