mod api;
mod database;
mod errors;
#[macro_use]
mod macros;
mod types;

use crate::database::create::setup_db;
use tauri::{
    generate_handler, LogicalPosition, Manager, TitleBarStyle, WebviewUrl, WebviewWindowBuilder,
};
#[cfg(target_os = "windows")]
use window_vibrancy::apply_blur;
#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

struct AppState {
    db: database::Db,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()

        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .invoke_handler(generate_handler![
            api::recipe::new::api_recipe_new,
            api::recipes::api_recipes
        ])
        .setup(|app| {
            let db = tauri::async_runtime::block_on(async { setup_db(app).await });
            app.manage(AppState { db });

            // Initialize Stronghold using Argon2 KDF and a salt file stored in the
            // application's local data directory. If the salt file doesn't exist yet,
            // create it with secure random bytes and restrictive permissions before
            // registering the plugin.
            let salt_path = app
                .path()
                .app_local_data_dir()
                .expect("could not resolve app local data path")
                .join("salt.txt");
            if let Some(parent) = salt_path.parent() {
                std::fs::create_dir_all(parent)?;
            }
            if !salt_path.exists() {
                // Generate a 32-byte random salt using the OS RNG via getrandom
                let mut salt = [0u8; 32];
                getrandom::getrandom(&mut salt).map_err(|e| {
                    std::io::Error::new(std::io::ErrorKind::Other, format!("getrandom failed: {}", e))
                })?;
                std::fs::write(&salt_path, &salt)?;
                // On Unix, set file permissions to 0o600
                #[cfg(unix)]
                {
                    use std::os::unix::fs::PermissionsExt;
                    let mut perms = std::fs::metadata(&salt_path)?.permissions();
                    perms.set_mode(0o600);
                    std::fs::set_permissions(&salt_path, perms)?;
                }
            }
            app.handle()
                .plugin(tauri_plugin_stronghold::Builder::with_argon2(&salt_path).build())?;

            let win_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
                .title("ChefDeck")
                .transparent(true)
                .inner_size(800.0, 600.0);

            // set transparent title bar only when building for macOS
            #[cfg(target_os = "macos")]
            let win_builder = win_builder
                .title("")
                .title_bar_style(TitleBarStyle::Overlay)
                .traffic_light_position(LogicalPosition::new(18.0, 25.0));

            let window = win_builder.build().unwrap();

            #[cfg(target_os = "macos")]
            {
                // macOS vibrancy
                apply_vibrancy(&window, NSVisualEffectMaterial::Sidebar, None, None)
                    .expect("Unsupported platform or failed to apply vibrancy");
            }

            #[cfg(target_os = "windows")]
            {
                // Windows blur or acrylic
                // Choose one:
                apply_blur(&window, Some((18, 18, 18, 125))).expect("Failed to apply blur");
                // or
                // apply_acrylic(&window, Some((0, 0, 0, 125)))
                //     .expect("Failed to apply acrylic");
            }

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
