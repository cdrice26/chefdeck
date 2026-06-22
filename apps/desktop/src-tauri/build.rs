fn main() {
    let api_url = if cfg!(debug_assertions) {
        "https://chefdeck.vercel.app/api"
    } else {
        "https://chefdeck.vercel.app/api"
    };

    println!("cargo:rustc-env=API_URL={}", api_url);
    tauri_build::build()
}
