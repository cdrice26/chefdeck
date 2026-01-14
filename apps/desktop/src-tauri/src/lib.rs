mod api;
mod database;
mod errors;
#[macro_use]
mod macros;
mod types;
mod token_keyring;

use crate::database::create::setup_db;
use tauri::{
    generate_handler, LogicalPosition, Manager, TitleBarStyle, WebviewUrl, WebviewWindowBuilder,
};
#[cfg(target_os = "windows")]
use window_vibrancy::apply_blur;
#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};
use tokio::sync::Mutex;

struct AppState {
    db: database::Db,
    access_token: Mutex<Option<String>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .invoke_handler(generate_handler![
            api::recipe::new::api_recipe_new,
            api::recipes::api_recipes,
            api::auth::login::api_auth_login
        ])
        .setup(|app| {
            let db = tauri::async_runtime::block_on(async { setup_db(app).await });
            app.manage(AppState { db, access_token: Mutex::new(None) });

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
