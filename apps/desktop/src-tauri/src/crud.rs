use tauri::AppHandle;

pub mod cloud_id;
pub mod recipe;
pub mod recipe_data;
pub mod recipes;
pub mod schedules;
pub mod tag;
pub mod tag_cloud_id;
pub mod tags;

pub trait Creatable {
    async fn create(
        &self,
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
    ) -> Result<i64, Box<dyn std::error::Error>>;
}

pub trait ReadableWith<T>: Sized {
    async fn read_with(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        id: i64,
        addl_params: T,
    ) -> Result<Self, Box<dyn std::error::Error>>;
}

pub trait Readable: Sized {
    async fn read(
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
        id: i64,
    ) -> Result<Self, Box<dyn std::error::Error>>;
}

pub trait Updatable {
    async fn update(
        &self,
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
    ) -> Result<i64, Box<dyn std::error::Error>>;
}

pub trait Deletable {
    async fn delete(
        &self,
        tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
    ) -> Result<(), Box<dyn std::error::Error>>;
}

pub trait Downloadable: Sized {
    async fn download(app: &AppHandle) -> Result<Self, Box<dyn std::error::Error>>;
}

pub trait DownloadableWith<T>: Sized {
    async fn download_with(
        app: &AppHandle,
        addl_params: T,
    ) -> Result<Self, Box<dyn std::error::Error>>;
}

pub trait Uploadable {
    async fn upload(&self, app: &AppHandle) -> Result<(), Box<dyn std::error::Error>>;
}

pub trait RemoteUpdatable {
    async fn update_remote(&self, app: &AppHandle) -> Result<(), Box<dyn std::error::Error>>;
}

pub trait RemoteDeletable {
    async fn delete_remote(&self, app: &AppHandle) -> Result<(), Box<dyn std::error::Error>>;
}
