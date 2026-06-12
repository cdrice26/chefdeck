use std::path::PathBuf;

pub struct UsernameFilter<'a> {
    pub username: &'a String,
}

pub struct ImagesLibPath<'a> {
    pub images_lib_path: &'a PathBuf,
}

pub struct RecipeSearchParams<'a> {
    pub page: u32,
    pub limit: u32,
    pub q: String,
    pub tags: String,
    pub images_lib_path: &'a PathBuf,
}

pub struct UsernameFilterWithImagesLibPath<'a> {
    pub username: &'a String,
    pub images_lib_path: &'a PathBuf,
}

pub struct UsernameAndUpdatedFilter<'a> {
    pub username: &'a String,
    pub updated_after: &'a chrono::NaiveDateTime,
    pub images_lib_path: &'a PathBuf,
}
