use sqlx::{Pool, Sqlite};

use crate::{
    api::recipe::{
        new::{insert_cloud_parent_id, insert_related_data},
        update_dates,
    },
    crud::Creatable,
    types::raw_db::{HasRecipeContext, RawRecipeCommon},
};

impl<T: RawRecipeCommon + HasRecipeContext> Creatable for T {
    async fn create(
        &self,
        db: &Pool<Sqlite>,
        username: Option<String>,
    ) -> Result<i64, Box<dyn std::error::Error>> {
        let recipe_id = run_tx_with_error!(db, async |tx: &mut sqlx::SqliteTransaction| {
            let title = self.title();
            let yield_ = self.yield_();
            let minutes = self.minutes();
            let img_url = self.img_url();
            let color = self.color();
            let source = self.source();

            let row = sqlx::query_file!(
                "db/insert_recipe.sql",
                title,
                yield_,
                minutes,
                img_url,
                color,
                source
            )
            .fetch_one(&mut **tx)
            .await?;

            let recipe_id: i64 = row.id;

            update_dates(
                tx,
                &self
                    .last_viewed()
                    .as_ref()
                    .map(|v| v.format("%Y-%m-%d %H:%M:%S").to_string()),
                &self
                    .last_updated()
                    .as_ref()
                    .map(|v| v.format("%Y-%m-%d %H:%M:%S").to_string()),
                recipe_id,
            )
            .await?;

            if let Some(online_recipe_id) = self.cloud_parent_id() {
                if let Some(username) = username {
                    insert_cloud_parent_id(
                        tx,
                        recipe_id,
                        username.as_str(),
                        online_recipe_id.as_str(),
                    )
                    .await?;
                }
            }

            insert_related_data(
                tx,
                recipe_id,
                self.ingredients(),
                self.directions(),
                self.tags(),
            )
            .await
        });
        Ok(recipe_id)
    }
}
