import { spawn } from 'node:child_process';
import process from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { appendFileSync, readFileSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, '..', '..', '..');
process.chdir(repoRoot);

function run(cmd, args, { shell = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code ?? 1}`));
    });
  });
}

// Replacement for: `yes | generate-license-file ...`
function runWithYes(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: ['pipe', 'inherit', 'inherit'],
      shell: true
    });

    child.on('error', reject);

    const y = 'y\n';
    const interval = setInterval(() => {
      // Keep writing until the command exits.
      // (stdin will be closed automatically after exit)
      child.stdin.write(y);
    }, 10);

    child.on('exit', (code) => {
      clearInterval(interval);
      try {
        child.stdin.end();
      } catch {}
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code ?? 1}`));
    });
  });
}

async function main() {
  await runWithYes('generate-license-file', [
    '--input',
    'package.json',
    '--output',
    'apps/desktop/src/licenses-js.txt'
  ]);

  await run('cargo', [
    'about',
    'generate',
    '-m',
    'apps/desktop/src-tauri/Cargo.toml',
    'apps/desktop/src-tauri/about.hbs',
    '-o',
    'apps/desktop/src/licenses-rust.txt'
  ]);

  appendFileSync(
    'apps/desktop/src/licenses-rust.txt',
    `WordNet Release 3.0 This software and database is being provided to you, the LICENSEE, by Princeton University under the following license. By obtaining, using and/or copying this software and database, you agree that you have read, understood, and will comply with these terms and conditions.: Permission to use, copy, modify and distribute this software and database and its documentation for any purpose and without fee or royalty is hereby granted, provided that you agree to comply with the following copyright notice and statements, including the disclaimer, and that the same appear on ALL copies of the software, database and documentation, including modifications that you make for internal use or for distribution. WordNet 3.0 Copyright 2006 by Princeton University. All rights reserved. THIS SOFTWARE AND DATABASE IS PROVIDED "AS IS" AND PRINCETON UNIVERSITY MAKES NO REPRESENTATIONS OR WARRANTIES, EXPRESS OR IMPLIED. BY WAY OF EXAMPLE, BUT NOT LIMITATION, PRINCETON UNIVERSITY MAKES NO REPRESENTATIONS OR WARRANTIES OF MERCHANT- ABILITY OR FITNESS FOR ANY PARTICULAR PURPOSE OR THAT THE USE OF THE LICENSED SOFTWARE, DATABASE OR DOCUMENTATION WILL NOT INFRINGE ANY THIRD PARTY PATENTS, COPYRIGHTS, TRADEMARKS OR OTHER RIGHTS. The name of Princeton University or Princeton may not be used in advertising or publicity pertaining to distribution of the software and/or database. Title to copyright in this software, database and any associated documentation shall at all times remain with Princeton University and LICENSEE agrees to preserve same.`
  );

  // 4. append Ionicons license
  const c = readFileSync('apps/desktop/IoniconsLicense', 'utf8');
  appendFileSync('apps/desktop/src/licenses-js.txt', c);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
