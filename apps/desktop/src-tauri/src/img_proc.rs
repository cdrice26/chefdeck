use std::{fs, path::PathBuf};

use image::{imageops, ImageReader};
use tauri::{AppHandle, State};
use uuid::Uuid;

use crate::{request::get, types::raw_db::RawRecipe, AppState};

/// Process an image and save it to a new location.
/// Resizes the image to a maximum width and height of 1000 pixels.
///
/// # Arguments
/// * `image` - The path to the image to process.
/// * `new_location` - The path to save the processed image to.
fn process_image(image: Option<&str>, new_location: &PathBuf) {
    // If no image path is provided, exit early
    let image_path = match image {
        Some(path) => path,
        None => return,
    };

    // Try to open the image, return early if it fails
    let reader = match ImageReader::open(image_path) {
        Ok(reader) => reader,
        Err(err) => {
            eprintln!("Error opening image: {}", err);
            return;
        }
    };

    // Try to decode the image
    let decoded = match reader.decode() {
        Ok(img) => img,
        Err(err) => {
            eprintln!("Error decoding image: {}", err);
            return;
        }
    };

    // Ensure parent directory exists (create recursively if needed)
    if let Some(parent) = new_location.parent() {
        if let Err(err) = fs::create_dir_all(parent) {
            eprintln!("Failed to create directories {:?}: {}", parent, err);
            return;
        }
    }

    // Resize and save
    let resized = decoded.resize(1000, 1000, imageops::FilterType::Lanczos3);
    if let Err(err) = resized.save(new_location) {
        eprintln!("Error saving image: {}", err);
    }
}

/// Processes an image, saves it in the app data directory, and
/// returns the path to the processed image.
///
/// # Arguments
/// * `image` - The path to the image to process.
/// * `images_lib_path` - The path to the app data directory.
///
/// # Returns
/// * `Option<String>` - The path to the processed image, or None if an error occurred.
pub fn get_processed_image(image: Option<String>, images_lib_path: &PathBuf) -> Option<String> {
    let image_path = if let Some(image) = image {
        let image_name = Uuid::new_v4().to_string() + ".jpg";
        let image_path_obj = images_lib_path.join(&image_name);
        process_image(Some(&image), &image_path_obj);
        Some(image_name)
    } else {
        None
    };
    image_path
}

/// Downloads an image from a signed URL.
pub async fn download_image_from_signed_url(url: &str) -> Result<Vec<u8>, String> {
    let client = reqwest::Client::new();

    let resp = client.get(url).send().await.map_err(|e| e.to_string())?;

    if !resp.status().is_success() {
        return Err(format!("Failed to download image: {}", resp.status()));
    }

    let bytes = resp.bytes().await.map_err(|e| e.to_string())?;
    Ok(bytes.to_vec())
}

/// Saves a downloaded image to the app data directory.
///
/// # Arguments
/// * `image_bytes` - The image data as bytes.
/// * `images_lib_path` - The path to the app data directory.
pub fn save_image(image_bytes: &[u8], images_lib_path: &PathBuf) -> Option<String> {
    let image_name = Uuid::new_v4().to_string() + ".jpg";
    let image_path = images_lib_path.join(&image_name);
    std::fs::write(&image_path, image_bytes).ok()?;
    Some(image_name)
}

/// Deletes the image associated with a recipe from the app data directory.
///
/// # Arguments
///
/// * `tx` - The transaction to use for the query.
/// * `id` - The ID of the recipe to delete the image for.
/// * `images_lib_path` - The path to the app data directory.
pub async fn delete_recipe_img(
    tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
    id: i64,
    images_lib_path: &PathBuf,
) -> Result<(), Box<dyn std::error::Error>> {
    let recipe = sqlx::query_file_as!(RawRecipe, "db/get_recipe.sql", id)
        .fetch_one(&mut **tx)
        .await?;
    let img_path = recipe.img_url;
    if let Some(img_path) = img_path {
        std::fs::remove_file(images_lib_path.join(img_path))?;
    }
    Ok(())
}

/// Converts a cloud image URL to a local image path by downloading the image and saving it to the app data directory.
///
/// # Arguments
///
/// * `image_path` - The path to the image to convert.
/// * `recipe_id` - The ID of the recipe to convert the image for.
/// * `app` - The app handle to use for the download.
/// * `images_lib_path` - The path to the app data directory.
///
/// # Returns
///
/// Returns the local image path as an `Result<Option<String>>`.
pub async fn convert_cloud_img_to_local(
    image_path: &Option<String>,
    recipe_id: &str,
    app: &AppHandle,
    images_lib_path: &PathBuf,
) -> Result<Option<String>, Box<dyn std::error::Error>> {
    match image_path {
        Some(_) => {
            let signed_url_response = get(&app, &format!("/recipe/{}/imageUrl", recipe_id)).await?;
            let signed_url: String = signed_url_response.text().await?;
            let image_bytes = download_image_from_signed_url(&signed_url).await?;
            Ok(save_image(&image_bytes, images_lib_path))
        }
        None => Ok(None),
    }
}

/// Gets local image path for upload to cloud
///
/// Arguments:
/// * `state` - A reference to the application state.
/// * `image_path` - The name of the image file.
///
/// Returns:
/// * `String` - The path to the image in the cloud.
pub async fn get_cloud_image_path(
    state: &State<'_, AppState>,
    image_path: &Option<String>,
) -> Option<String> {
    match &image_path {
        Some(image_path) => Some(
            state
                .images_lib_path
                .join(image_path)
                .to_string_lossy()
                .to_string(),
        ),
        None => None,
    }
}
