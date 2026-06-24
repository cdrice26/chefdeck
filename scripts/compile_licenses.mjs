import { execSync } from 'child_process';
import fs from 'fs';

// 1. generate-license-file (auto-accept prompt)
execSync(
  'generate-license-file --input package.json --output ThirdPartyNotices.txt',
  {
    input: 'yes\n',
    stdio: ['pipe', 'inherit', 'inherit']
  }
);

// 2. cargo about generate, append to file
const cargoOutput = execSync(
  'cargo about generate -m packages/groceryify/Cargo.toml --target wasm32-unknown-unknown packages/groceryify/about.hbs --features wasm',
  { encoding: 'utf8' }
);
fs.appendFileSync('ThirdPartyNotices.txt', cargoOutput);

// 3. append wordnet license
const out = 'ThirdPartyNotices.txt';
const a = fs.readFileSync(out, 'utf8');
const b = fs.readFileSync(
  'packages/groceryify/resources/nounexc_license',
  'utf8'
);

// 4. append Ionicons license
const c = fs.readFileSync('apps/web/IoniconsLicense', 'utf8');
fs.writeFileSync(out, a + b + c);
