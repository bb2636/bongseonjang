import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const capacitorSettingsPath = join(__dirname, '../android/capacitor.settings.gradle');

try {
  let content = readFileSync(capacitorSettingsPath, 'utf8');
  
  content = content.replace(
    /project\(':capacitor-android'\)\.projectDir = new File\('\.\.\/\.\.\/\.\.\/node_modules\/@capacitor\/android\/capacitor'\)/g,
    "project(':capacitor-android').projectDir = new File('../node_modules/@capacitor/android/capacitor')"
  );
  
  content = content.replace(
    /project\(':capacitor-browser'\)\.projectDir = new File\('\.\.\/\.\.\/\.\.\/node_modules\/@capacitor\/browser\/android'\)/g,
    "project(':capacitor-browser').projectDir = new File('../node_modules/@capacitor/browser/android')"
  );
  
  writeFileSync(capacitorSettingsPath, content, 'utf8');
  console.log('✔ Fixed capacitor.settings.gradle paths');
} catch (error) {
  console.error('Failed to fix capacitor paths:', error.message);
  process.exit(1);
}
