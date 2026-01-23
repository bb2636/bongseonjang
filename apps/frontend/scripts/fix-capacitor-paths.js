import { readFileSync, writeFileSync, cpSync, existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const frontendDir = join(__dirname, '..');
const androidDir = join(frontendDir, 'android');
const nodeModulesDir = join(frontendDir, 'node_modules');

const plugins = [
  { name: 'capacitor-app', source: '@capacitor/app/android' },
  { name: 'capacitor-browser', source: '@capacitor/browser/android' }
];

try {
  for (const plugin of plugins) {
    const sourcePath = join(nodeModulesDir, plugin.source);
    const destPath = join(androidDir, plugin.name);
    
    if (existsSync(sourcePath)) {
      if (existsSync(destPath)) {
        rmSync(destPath, { recursive: true, force: true });
      }
      cpSync(sourcePath, destPath, { recursive: true });
      console.log(`✔ Copied ${plugin.name}`);
    } else {
      console.error(`✖ Source not found: ${sourcePath}`);
    }
  }

  const settingsGradlePath = join(androidDir, 'settings.gradle');
  const settingsContent = `include ':app'
include ':capacitor-cordova-android-plugins'
project(':capacitor-cordova-android-plugins').projectDir = new File('./capacitor-cordova-android-plugins/')

include ':capacitor-android'
project(':capacitor-android').projectDir = new File('./capacitor-android')

include ':capacitor-app'
project(':capacitor-app').projectDir = new File('./capacitor-app')

include ':capacitor-browser'
project(':capacitor-browser').projectDir = new File('./capacitor-browser')
`;

  writeFileSync(settingsGradlePath, settingsContent, 'utf8');
  console.log('✔ Updated settings.gradle with local plugin paths');

  console.log('✔ Android build is now standalone - no node_modules required');
} catch (error) {
  console.error('Failed to fix capacitor build:', error.message);
  process.exit(1);
}
