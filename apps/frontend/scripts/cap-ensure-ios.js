import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.join(__dirname, '..');
const ROOT_DIR = path.join(FRONTEND_DIR, '../..');
const IOS_APP_DIR = path.join(FRONTEND_DIR, 'ios', 'App');

function q(p) {
  return `"${p}"`;
}

function findCapBinary() {
  const localBin = path.join(FRONTEND_DIR, 'node_modules', '.bin', 'cap');
  if (fs.existsSync(localBin)) return q(localBin);

  const rootBin = path.join(ROOT_DIR, 'node_modules', '.bin', 'cap');
  if (fs.existsSync(rootBin)) return q(rootBin);

  const cliEntry = path.join(FRONTEND_DIR, 'node_modules', '@capacitor', 'cli', 'bin', 'capacitor.js');
  if (fs.existsSync(cliEntry)) return `node ${q(cliEntry)}`;

  const rootCliEntry = path.join(ROOT_DIR, 'node_modules', '@capacitor', 'cli', 'bin', 'capacitor.js');
  if (fs.existsSync(rootCliEntry)) return `node ${q(rootCliEntry)}`;

  return 'npx cap';
}

if (!fs.existsSync(IOS_APP_DIR)) {
  console.log('iOS platform not found. Adding...');
  const cap = findCapBinary();
  execSync(`${cap} add ios`, { stdio: 'inherit', cwd: FRONTEND_DIR });
  console.log('iOS platform added.');
} else {
  console.log('iOS platform exists.');
}
