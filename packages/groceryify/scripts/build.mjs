import { execSync } from 'child_process';
import { copyFileSync, mkdirSync } from 'fs';

execSync(
  'cargo build --target wasm32-unknown-unknown --release --all-features',
  { stdio: 'inherit' }
);
execSync(
  'wasm-bindgen --target nodejs --out-dir ./pkg ./target/wasm32-unknown-unknown/release/groceryify.wasm',
  { stdio: 'inherit' }
);
copyFileSync('package.json', 'pkg/package.json');
