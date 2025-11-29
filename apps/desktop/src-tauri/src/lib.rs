use tauri::{LogicalPosition, TitleBarStyle, WebviewUrl, WebviewWindowBuilder};
#[cfg(target_os = "windows")]
use window_vibrancy::apply_blur;
#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
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
