use std::{fs, path::PathBuf};

use image::{imageops, ImageReader};
use uuid::Uuid;

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
