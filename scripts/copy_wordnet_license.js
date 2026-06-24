import fs from 'fs';

const out = 'ThirdPartyNotices.txt';
const a = fs.readFileSync(out, 'utf8');
const b = fs.readFileSync(
  'packages/groceryify/resources/nounexc_license',
  'utf8'
);
fs.writeFileSync(out, a + b);
