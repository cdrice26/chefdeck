cargo build --target wasm32-unknown-unknown --release --all-features
wasm-bindgen --target bundler --out-dir ./pkg ./target/wasm32-unknown-unknown/release/groceryify.wasm
cp package.json pkg/
