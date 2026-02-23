import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.join(__dirname, '..');
const ROOT_DIR = path.join(FRONTEND_DIR, '../..');
const IOS_DIR = path.join(FRONTEND_DIR, 'ios');

function q(p) {
  return `"${p}"`;
}

function run(cmd, cwd = FRONTEND_DIR) {
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, { stdio: 'inherit', cwd });
}

function findBin(name) {
  const frontendBin = path.join(FRONTEND_DIR, 'node_modules', '.bin', name);
  if (fs.existsSync(frontendBin)) return frontendBin;

  const rootBin = path.join(ROOT_DIR, 'node_modules', '.bin', name);
  if (fs.existsSync(rootBin)) return rootBin;

  return null;
}

function findCapBinary() {
  const bin = findBin('cap');
  if (bin) return q(bin);

  const cliEntry = path.join(FRONTEND_DIR, 'node_modules', '@capacitor', 'cli', 'bin', 'capacitor.js');
  if (fs.existsSync(cliEntry)) return `node ${q(cliEntry)}`;

  const rootCliEntry = path.join(ROOT_DIR, 'node_modules', '@capacitor', 'cli', 'bin', 'capacitor.js');
  if (fs.existsSync(rootCliEntry)) return `node ${q(rootCliEntry)}`;

  return 'npx cap';
}

function ensureDependencies() {
  const rootNodeModules = path.join(ROOT_DIR, 'node_modules');
  const frontendNodeModules = path.join(FRONTEND_DIR, 'node_modules');

  if (fs.existsSync(rootNodeModules) && fs.existsSync(frontendNodeModules)) {
    return;
  }

  console.log('\n=== Dependencies not found. Running npm install... ===');
  run('npm install', ROOT_DIR);
  console.log('Dependencies installed.');
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
  const assetsBin = findBin('capacitor-assets');
  if (assetsBin) {
    try {
      run(`${q(assetsBin)} generate --iconBackgroundColor "#FFFFFF" --splashBackgroundColor "#FFFFFF" --ios`);
      return;
    } catch {
      console.log('  @capacitor/assets failed — icon will be copied by fix-ios-native.js');
    }
  } else {
    console.log('  @capacitor/assets not installed — icon will be copied by fix-ios-native.js');
  }
}

function buildFrontend() {
  console.log('\n=== Building frontend ===');
  const viteBin = findBin('vite');
  if (!viteBin) {
    console.error('ERROR: vite not found. Run "npm install" from project root first.');
    process.exit(1);
  }
  run(`${q(viteBin)} build --mode capacitor`);
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
  console.log('\n=== Full build: cleaning all node_modules ===');
  const dirsToClean = [
    path.join(ROOT_DIR, 'node_modules'),
    path.join(ROOT_DIR, 'package-lock.json'),
    path.join(FRONTEND_DIR, 'node_modules'),
    path.join(ROOT_DIR, 'apps', 'backend', 'node_modules'),
  ];
  for (const dir of dirsToClean) {
    if (fs.existsSync(dir)) {
      console.log(`  Removing ${path.relative(ROOT_DIR, dir)}`);
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
  console.log('\n=== Installing dependencies ===');
  run('npm install', ROOT_DIR);
} else {
  ensureDependencies();
}

ensureiOSPlatform();
generateAssets();
buildFrontend();
syncAndFix();
openXcode();

console.log('\n=== Build complete! ===');
console.log('Open Xcode: open ios/App/App.xcworkspace');
