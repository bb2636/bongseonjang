import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.join(__dirname, '..');
const ROOT_DIR = path.join(FRONTEND_DIR, '../..');
const IOS_DIR = path.join(FRONTEND_DIR, 'ios');

function findCapBinary() {
  const localBin = path.join(FRONTEND_DIR, 'node_modules', '.bin', 'cap');
  if (fs.existsSync(localBin)) return localBin;

  const rootBin = path.join(ROOT_DIR, 'node_modules', '.bin', 'cap');
  if (fs.existsSync(rootBin)) return rootBin;

  const cliEntry = path.join(FRONTEND_DIR, 'node_modules', '@capacitor', 'cli', 'bin', 'capacitor.js');
  if (fs.existsSync(cliEntry)) return `node ${cliEntry}`;

  const rootCliEntry = path.join(ROOT_DIR, 'node_modules', '@capacitor', 'cli', 'bin', 'capacitor.js');
  if (fs.existsSync(rootCliEntry)) return `node ${rootCliEntry}`;

  return 'npx cap';
}

function run(cmd, cwd = FRONTEND_DIR) {
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, { stdio: 'inherit', cwd });
}

function ensureiOSPlatform() {
  if (fs.existsSync(path.join(IOS_DIR, 'App'))) {
    console.log('iOS platform already exists.');
    return;
  }

  console.log('iOS platform not found. Adding...');
  const cap = findCapBinary();
  run(`${cap} add ios`);
  console.log('iOS platform added successfully.');
}

function generateAssets() {
  console.log('\n=== Generating assets ===');
  try {
    run('npx @capacitor/assets generate --iconBackgroundColor "#FFFFFF" --splashBackgroundColor "#FFFFFF" --ios');
  } catch {
    console.log('Asset generation warning (non-critical, continuing).');
  }
}

function buildFrontend() {
  console.log('\n=== Building frontend ===');
  run('npx vite build --mode capacitor');
}

function syncAndFix() {
  console.log('\n=== Syncing iOS ===');
  const cap = findCapBinary();
  run(`${cap} sync ios`);
  console.log('\n=== Applying native fixes ===');
  run('node scripts/fix-ios-native.js');
}

function openXcode() {
  const shouldOpen = process.argv.includes('--open');
  if (shouldOpen) {
    console.log('\n=== Opening Xcode ===');
    try {
      const cap = findCapBinary();
      run(`${cap} open ios`);
    } catch {
      console.log('Could not open Xcode automatically.');
      console.log('Open manually: open ios/App/App.xcworkspace');
    }
  }
}

const mode = process.argv[2] || 'quick';

console.log('=== Capacitor iOS Build ===');
console.log(`Mode: ${mode}`);

if (mode === 'full') {
  console.log('\n=== Full build: reinstalling dependencies ===');
  run('rm -rf node_modules package-lock.json && npm install', ROOT_DIR);
}

generateAssets();
buildFrontend();
ensureiOSPlatform();
syncAndFix();
openXcode();

console.log('\n=== Build complete! ===');
console.log('Open Xcode: open ios/App/App.xcworkspace');
