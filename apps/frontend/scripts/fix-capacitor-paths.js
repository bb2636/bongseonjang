import { readFileSync, writeFileSync, cpSync, existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const frontendDir = join(__dirname, '..');
const androidDir = join(frontendDir, 'android');
const nodeModulesDir = join(frontendDir, 'node_modules');

const CAPACITOR_VERSION = '7.4.4';
const ANDROID_GRADLE_PLUGIN_VERSION = '8.7.2';

const ANDROID_PLUGINS = [
  { name: 'capacitor-app', source: '@capacitor/app/android' },
  { name: 'capacitor-browser', source: '@capacitor/browser/android' },
  { name: 'capacitor-camera', source: '@capacitor/camera/android' },
  { name: 'capacitor-share', source: '@capacitor/share/android' },
  { name: 'capgo-inappbrowser', source: '@capgo/inappbrowser/android' },
];

const VALID_GRADLE_PROJECTS = new Set([
  ...ANDROID_PLUGINS.map(p => p.name),
  'capacitor-android',
  'capacitor-cordova-android-plugins',
]);

function copyCapacitorAndroid() {
  const sourcePath = join(nodeModulesDir, '@capacitor/android/capacitor');
  const destPath = join(androidDir, 'capacitor-android');

  if (!existsSync(sourcePath)) {
    console.error('✖ capacitor-android source not found:', sourcePath);
    return;
  }

  if (existsSync(destPath)) {
    rmSync(destPath, { recursive: true, force: true });
  }
  cpSync(sourcePath, destPath, { recursive: true });
  console.log('✔ Copied capacitor-android');
}

function copyPlugins() {
  for (const plugin of ANDROID_PLUGINS) {
    const sourcePath = join(nodeModulesDir, plugin.source);
    const destPath = join(androidDir, plugin.name);

    if (!existsSync(sourcePath)) {
      console.error(`✖ Source not found: ${sourcePath}`);
      continue;
    }

    if (existsSync(destPath)) {
      rmSync(destPath, { recursive: true, force: true });
    }
    cpSync(sourcePath, destPath, { recursive: true });
    console.log(`✔ Copied ${plugin.name}`);

    patchPluginBuildGradle(destPath, plugin.name);
  }
}

function patchPluginBuildGradle(pluginDir, pluginName) {
  const buildGradlePath = join(pluginDir, 'build.gradle');
  if (!existsSync(buildGradlePath)) return;

  let content = readFileSync(buildGradlePath, 'utf8');
  let patched = false;

  if (content.includes("System.getenv('CAPACITOR_VERSION')")) {
    content = content.replace(
      /capacitorVersion\s*=\s*System\.getenv\('CAPACITOR_VERSION'\)/g,
      `capacitorVersion = System.getenv('CAPACITOR_VERSION') ?: '${CAPACITOR_VERSION}'`
    );
    patched = true;
  }

  const gradlePluginRegex = /com\.android\.tools\.build:gradle:[\d.]+/g;
  if (gradlePluginRegex.test(content)) {
    content = content.replace(
      /com\.android\.tools\.build:gradle:[\d.]+/g,
      `com.android.tools.build:gradle:${ANDROID_GRADLE_PLUGIN_VERSION}`
    );
    patched = true;
  }

  if (patched) {
    writeFileSync(buildGradlePath, content, 'utf8');
    console.log(`  ✔ Patched ${pluginName}/build.gradle`);
  }
}

function ensureGradleProperties() {
  const gradlePropsPath = join(androidDir, 'gradle.properties');

  const requiredProps = {
    'android.useAndroidX': 'true',
    'android.enableJetifier': 'true',
  };

  let content = '';
  if (existsSync(gradlePropsPath)) {
    content = readFileSync(gradlePropsPath, 'utf8');
  }

  let modified = false;
  for (const [key, value] of Object.entries(requiredProps)) {
    const regex = new RegExp(`^${key.replace('.', '\\.')}\\s*=`, 'm');
    if (!regex.test(content)) {
      content += `\n${key}=${value}`;
      modified = true;
    }
  }

  if (modified) {
    writeFileSync(gradlePropsPath, content.trim() + '\n', 'utf8');
    console.log('✔ Updated gradle.properties (AndroidX enabled)');
  }
}

function writeSettingsGradle() {
  const settingsGradlePath = join(androidDir, 'settings.gradle');

  const lines = [
    "include ':app'",
    "include ':capacitor-cordova-android-plugins'",
    "project(':capacitor-cordova-android-plugins').projectDir = new File('./capacitor-cordova-android-plugins/')",
    "",
    "include ':capacitor-android'",
    "project(':capacitor-android').projectDir = new File('./capacitor-android')",
  ];

  for (const plugin of ANDROID_PLUGINS) {
    lines.push('');
    lines.push(`include ':${plugin.name}'`);
    lines.push(`project(':${plugin.name}').projectDir = new File('./${plugin.name}')`);
  }
  lines.push('');

  writeFileSync(settingsGradlePath, lines.join('\n'), 'utf8');
  console.log('✔ Updated settings.gradle');
}

function cleanCapacitorBuildGradle() {
  const buildGradlePath = join(androidDir, 'app', 'capacitor.build.gradle');
  if (!existsSync(buildGradlePath)) return;

  let content = readFileSync(buildGradlePath, 'utf8');
  const originalContent = content;

  const lines = content.split('\n');
  const cleanedLines = lines.filter(line => {
    const projectMatch = line.match(/project\(':([^']+)'\)/);
    if (!projectMatch) return true;

    const projectName = projectMatch[1];
    if (VALID_GRADLE_PROJECTS.has(projectName)) return true;

    console.log(`  ✔ Removed invalid project reference: ${projectName}`);
    return false;
  });

  content = cleanedLines.join('\n');

  if (content !== originalContent) {
    writeFileSync(buildGradlePath, content, 'utf8');
    console.log('✔ Cleaned capacitor.build.gradle');
  }
}

try {
  console.log('--- Fixing Android Capacitor build ---');
  copyCapacitorAndroid();
  copyPlugins();
  writeSettingsGradle();
  ensureGradleProperties();
  cleanCapacitorBuildGradle();
  console.log('✔ Android build is now standalone - no node_modules required');
} catch (error) {
  console.error('Failed to fix capacitor build:', error.message);
  process.exit(1);
}
