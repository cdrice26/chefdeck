fn main() {
    let api_url = if cfg!(debug_assertions) {
        "http://localhost:3000/api"
    } else {
        "https://chefdeck.vercel.app/api"
    };

    println!("cargo:rustc-env=API_URL={}", api_url);
    tauri_build::build()
}
