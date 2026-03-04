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
  { name: 'capacitor-browser', source: '@capacitor/browser/android' },
  { name: 'capacitor-camera', source: '@capacitor/camera/android' },
  { name: 'capacitor-share', source: '@capacitor/share/android' },
  { name: 'capgo-inappbrowser', source: '@capgo/inappbrowser/android' },
];

const IOS_ONLY_PLUGINS = [
  'capacitor-community-apple-sign-in',
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
  const pluginIncludes = plugins
    .map(p => `include ':${p.name}'\nproject(':${p.name}').projectDir = new File('./${p.name}')`)
    .join('\n\n');

  const settingsContent = `include ':app'
include ':capacitor-cordova-android-plugins'
project(':capacitor-cordova-android-plugins').projectDir = new File('./capacitor-cordova-android-plugins/')

include ':capacitor-android'
project(':capacitor-android').projectDir = new File('./capacitor-android')

${pluginIncludes}
`;

  writeFileSync(settingsGradlePath, settingsContent, 'utf8');
  console.log('✔ Updated settings.gradle with local plugin paths');

  const buildGradlePath = join(androidDir, 'app', 'capacitor.build.gradle');
  if (existsSync(buildGradlePath)) {
    let buildGradleContent = readFileSync(buildGradlePath, 'utf8');
    let cleaned = false;

    for (const iosPlugin of IOS_ONLY_PLUGINS) {
      const regex = new RegExp(`.*${iosPlugin}.*\\n?`, 'g');
      if (regex.test(buildGradleContent)) {
        buildGradleContent = buildGradleContent.replace(regex, '');
        cleaned = true;
        console.log(`✔ Removed iOS-only plugin reference: ${iosPlugin}`);
      }
    }

    if (cleaned) {
      writeFileSync(buildGradlePath, buildGradleContent, 'utf8');
      console.log('✔ Cleaned capacitor.build.gradle');
    }
  }

  console.log('✔ Android build is now standalone - no node_modules required');
} catch (error) {
  console.error('Failed to fix capacitor build:', error.message);
  process.exit(1);
}
