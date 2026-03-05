import { readFileSync, writeFileSync, cpSync, existsSync, rmSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const frontendDir = join(__dirname, '..');
const androidDir = join(frontendDir, 'android');
const nodeModulesDir = join(frontendDir, 'node_modules');

const CAPACITOR_VERSION = '7.4.4';
const ANDROID_GRADLE_PLUGIN_VERSION = '8.7.2';
const KOTLIN_VERSION = '1.9.25';
const COMPILE_SDK = 35;
const MIN_SDK = 23;
const TARGET_SDK = 35;

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
    process.exit(1);
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

function ensureCordovaPlugins() {
  const cordovaDir = join(androidDir, 'capacitor-cordova-android-plugins');

  if (existsSync(cordovaDir)) {
    console.log('✔ capacitor-cordova-android-plugins exists');
    return;
  }

  mkdirSync(cordovaDir, { recursive: true });
  mkdirSync(join(cordovaDir, 'src', 'main', 'java'), { recursive: true });
  mkdirSync(join(cordovaDir, 'src', 'main', 'res'), { recursive: true });

  const buildGradle = `
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:${ANDROID_GRADLE_PLUGIN_VERSION}'
    }
}

apply plugin: 'com.android.library'

android {
    namespace "cordova.plugins"
    compileSdk ${COMPILE_SDK}
    defaultConfig {
        minSdkVersion ${MIN_SDK}
        targetSdkVersion ${TARGET_SDK}
    }
    lintOptions {
        abortOnError false
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_21
        targetCompatibility JavaVersion.VERSION_21
    }
}

repositories {
    google()
    mavenCentral()
}

dependencies {
    implementation project(':capacitor-android')
}
`.trim() + '\n';

  writeFileSync(join(cordovaDir, 'build.gradle'), buildGradle, 'utf8');

  const manifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
</manifest>
`;
  writeFileSync(join(cordovaDir, 'src', 'main', 'AndroidManifest.xml'), manifest, 'utf8');

  console.log('✔ Created capacitor-cordova-android-plugins stub');
}

function ensureRootBuildGradle() {
  const rootBuildGradlePath = join(androidDir, 'build.gradle');

  if (existsSync(rootBuildGradlePath)) {
    let content = readFileSync(rootBuildGradlePath, 'utf8');
    let patched = false;

    const gradlePluginRegex = /com\.android\.tools\.build:gradle:[\d.]+/;
    if (gradlePluginRegex.test(content)) {
      content = content.replace(
        /com\.android\.tools\.build:gradle:[\d.]+/g,
        `com.android.tools.build:gradle:${ANDROID_GRADLE_PLUGIN_VERSION}`
      );
      patched = true;
    }

    if (!content.includes('kotlin-gradle-plugin')) {
      content = content.replace(
        /(classpath\s+'com\.android\.tools\.build:gradle:[^']+'\s*\n)/,
        `$1        classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin:${KOTLIN_VERSION}'\n`
      );
      patched = true;
    }

    if (patched) {
      writeFileSync(rootBuildGradlePath, content, 'utf8');
      console.log('✔ Patched root build.gradle');
    } else {
      console.log('✔ Root build.gradle exists');
    }
    return;
  }

  const content = `
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:${ANDROID_GRADLE_PLUGIN_VERSION}'
        classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin:${KOTLIN_VERSION}'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
`.trim() + '\n';

  writeFileSync(rootBuildGradlePath, content, 'utf8');
  console.log('✔ Created root build.gradle');
}

function ensureVariablesGradle() {
  const variablesPath = join(androidDir, 'variables.gradle');

  if (existsSync(variablesPath)) {
    console.log('✔ variables.gradle exists');
    return;
  }

  const content = `
ext {
    minSdkVersion = ${MIN_SDK}
    compileSdkVersion = ${COMPILE_SDK}
    targetSdkVersion = ${TARGET_SDK}
    androidxActivityVersion = '1.9.2'
    androidxAppCompatVersion = '1.7.0'
    androidxCoordinatorLayoutVersion = '1.2.0'
    androidxCoreVersion = '1.15.0'
    androidxFragmentVersion = '1.8.4'
    junitVersion = '4.13.2'
    androidxJunitVersion = '1.2.1'
    androidxEspressoCoreVersion = '3.6.1'
    cordovaAndroidVersion = '10.1.1'
    androidxWebkitVersion = '1.12.1'
    androidxBrowserVersion = '1.8.0'
    androidxMaterialVersion = '1.12.0'
    kotlin_version = '${KOTLIN_VERSION}'
}
`.trim() + '\n';

  writeFileSync(variablesPath, content, 'utf8');
  console.log('✔ Created variables.gradle');
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
    const regex = new RegExp(`^${key.replace(/\./g, '\\.')}\\s*=`, 'm');
    if (!regex.test(content)) {
      content += `\n${key}=${value}`;
      modified = true;
    }
  }

  if (modified) {
    writeFileSync(gradlePropsPath, content.trim() + '\n', 'utf8');
    console.log('✔ Updated gradle.properties (AndroidX enabled)');
  } else {
    console.log('✔ gradle.properties OK');
  }
}

function ensureGradleWrapper() {
  const wrapperDir = join(androidDir, 'gradle', 'wrapper');
  const propsPath = join(wrapperDir, 'gradle-wrapper.properties');

  if (existsSync(propsPath)) {
    console.log('✔ gradle-wrapper.properties exists');
    return;
  }

  mkdirSync(wrapperDir, { recursive: true });

  const content = `
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.11.1-all.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`.trim() + '\n';

  writeFileSync(propsPath, content, 'utf8');
  console.log('✔ Created gradle-wrapper.properties');
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

function validateStructure() {
  console.log('\n--- Validating Android project structure ---');
  const checks = [
    { path: 'capacitor-android/build.gradle', required: true },
    { path: 'capacitor-cordova-android-plugins/build.gradle', required: true },
    { path: 'settings.gradle', required: true },
    { path: 'gradle.properties', required: true },
    { path: 'build.gradle', required: true },
    { path: 'app/build.gradle', required: false },
    { path: 'app/capacitor.build.gradle', required: false },
    { path: 'app/src/main/AndroidManifest.xml', required: false },
    { path: 'gradle/wrapper/gradle-wrapper.properties', required: false },
    { path: 'variables.gradle', required: false },
  ];

  for (const plugin of ANDROID_PLUGINS) {
    checks.push({ path: `${plugin.name}/build.gradle`, required: true });
  }

  let hasErrors = false;
  for (const check of checks) {
    const fullPath = join(androidDir, check.path);
    const exists = existsSync(fullPath);
    const icon = exists ? '✔' : (check.required ? '✖' : '⚠');
    const label = exists ? 'OK' : (check.required ? 'MISSING (REQUIRED)' : 'MISSING (cap sync creates this)');
    console.log(`  ${icon} ${check.path} — ${label}`);
    if (!exists && check.required) hasErrors = true;
  }

  if (hasErrors) {
    console.error('\n✖ Required files are missing. Run "npx cap sync android" first, then re-run this script.');
    process.exit(1);
  }

  const appDir = join(androidDir, 'app');
  if (!existsSync(appDir)) {
    console.log('\n⚠ android/app/ directory not found.');
    console.log('  This is created by "npx cap sync android" or "npx cap add android".');
    console.log('  The fix script has set up all other modules. Run "npx cap sync android" if app/ is missing.');
  }

  console.log('');
}

try {
  console.log('=== Fixing Android Capacitor build ===\n');

  console.log('--- Step 1: Copy native modules ---');
  copyCapacitorAndroid();
  copyPlugins();

  console.log('\n--- Step 2: Ensure supporting files ---');
  ensureCordovaPlugins();
  ensureRootBuildGradle();
  ensureVariablesGradle();
  ensureGradleProperties();
  ensureGradleWrapper();

  console.log('\n--- Step 3: Configure Gradle project ---');
  writeSettingsGradle();
  cleanCapacitorBuildGradle();

  validateStructure();

  console.log('✔ Android build is now standalone — ready for Android Studio');
} catch (error) {
  console.error('Failed to fix capacitor build:', error.message);
  process.exit(1);
}
