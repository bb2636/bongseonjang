import { readFileSync, writeFileSync, cpSync, existsSync, rmSync, mkdirSync, readdirSync, renameSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

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

const APP_ID = 'com.bongseongjang.app';
const APP_NAME = '봉선장';
const TEMPLATE_PACKAGE = 'com.getcapacitor.myapp';

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

function patchBridgeOverScroll() {
  const bridgePath = join(androidDir, 'capacitor-android', 'src', 'main', 'java', 'com', 'getcapacitor', 'Bridge.java');
  if (!existsSync(bridgePath)) return;

  let content = readFileSync(bridgePath, 'utf8');

  if (content.includes('OVER_SCROLL_NEVER')) return;

  const importLine = 'import android.view.View;';
  if (!content.includes(importLine)) {
    content = content.replace(
      'import android.webkit.WebSettings;',
      `import android.view.View;\nimport android.webkit.WebSettings;`
    );
  }

  content = content.replace(
    'private void initWebView() {\n        WebSettings settings = webView.getSettings();',
    'private void initWebView() {\n        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);\n        WebSettings settings = webView.getSettings();'
  );

  writeFileSync(bridgePath, content, 'utf8');
  console.log('✔ Patched Bridge.java: disabled overscroll');
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

function ensureAppModule() {
  const appDir = join(androidDir, 'app');

  if (existsSync(join(appDir, 'build.gradle'))) {
    console.log('✔ app/ module exists');
    ensureColorsXml();
    ensureCapacitorBuildGradle();
    return;
  }

  const templateTar = join(nodeModulesDir, '@capacitor/cli/assets/android-template.tar.gz');
  if (!existsSync(templateTar)) {
    console.error('✖ android-template.tar.gz not found');
    process.exit(1);
  }

  const tmpDir = join(androidDir, '__template_tmp__');
  if (existsSync(tmpDir)) {
    rmSync(tmpDir, { recursive: true, force: true });
  }
  mkdirSync(tmpDir, { recursive: true });

  execSync(`tar -xzf "${templateTar}" -C "${tmpDir}"`, { stdio: 'pipe' });

  const templateAppDir = join(tmpDir, 'app');
  if (!existsSync(templateAppDir)) {
    console.error('✖ Template does not contain app/ directory');
    rmSync(tmpDir, { recursive: true, force: true });
    process.exit(1);
  }

  if (existsSync(appDir)) {
    rmSync(appDir, { recursive: true, force: true });
  }
  cpSync(templateAppDir, appDir, { recursive: true });

  rmSync(tmpDir, { recursive: true, force: true });

  patchAppBuildGradle();
  patchAndroidManifest();
  patchMainActivity();
  patchStringsXml();
  ensureColorsXml();
  ensureCapacitorBuildGradle();
  mkdirSync(join(appDir, 'src', 'main', 'assets', 'public'), { recursive: true });

  console.log('✔ Created app/ module from template');
}

function patchAppBuildGradle() {
  const buildGradlePath = join(androidDir, 'app', 'build.gradle');
  let content = readFileSync(buildGradlePath, 'utf8');

  content = content.replace(
    /namespace\s+"[^"]+"/,
    `namespace "${APP_ID}"`
  );

  content = content.replace(
    /applicationId\s+"[^"]+"/,
    `applicationId "${APP_ID}"`
  );

  content = content.replace(
    /compileSdk rootProject\.ext\.compileSdkVersion/,
    `compileSdk project.hasProperty('compileSdkVersion') ? rootProject.ext.compileSdkVersion : ${COMPILE_SDK}`
  );

  content = content.replace(
    /minSdkVersion rootProject\.ext\.minSdkVersion/,
    `minSdkVersion project.hasProperty('minSdkVersion') ? rootProject.ext.minSdkVersion : ${MIN_SDK}`
  );

  content = content.replace(
    /targetSdkVersion rootProject\.ext\.targetSdkVersion/,
    `targetSdkVersion project.hasProperty('targetSdkVersion') ? rootProject.ext.targetSdkVersion : ${TARGET_SDK}`
  );

  const SAFE_CAP_BUILD_GRADLE = `def capBuildFile = file('capacitor.build.gradle')
if (capBuildFile.exists()) {
    def safeDeps = []
    capBuildFile.eachLine { line ->
        def m = (line =~ /implementation\\s+project\\(':(.+?)'\\)/)
        if (m.find()) {
            if (findProject(":\${m.group(1)}") != null) {
                safeDeps.add(m.group(1))
            } else {
                logger.warn("Skipping missing project :\${m.group(1)}")
            }
        }
    }
    dependencies {
        safeDeps.each { name ->
            implementation project(":\${name}")
        }
    }
}`;

  content = content.replace(
    /apply from: 'capacitor\.build\.gradle'/,
    SAFE_CAP_BUILD_GRADLE
  );

  if (!content.includes('keystorePropertiesFile')) {
    const KEYSTORE_LOADER = `
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

`;
    content = content.replace(
      /apply plugin: 'com\.android\.application'\n/,
      `apply plugin: 'com.android.application'\n${KEYSTORE_LOADER}`
    );

    const SIGNING_CONFIGS_BLOCK = `    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            if (keystorePropertiesFile.exists()) {
                signingConfig signingConfigs.release
            }
        }
    }`;

    content = content.replace(
      /buildTypes\s*\{\s*release\s*\{[^}]*\}\s*\}/,
      SIGNING_CONFIGS_BLOCK
    );

    const PRINT_SHA_TASK = `
tasks.register('printSigningSha') {
    doLast {
        def variants = ['debug', 'release']
        variants.each { variantName ->
            def config = android.signingConfigs.findByName(variantName)
            if (config?.storeFile?.exists()) {
                println "\\n========== \${variantName.toUpperCase()} SIGNING ==========="
                println "Store: \${config.storeFile.absolutePath}"
                println "Alias: \${config.keyAlias}"
                def proc = ['keytool', '-list', '-v',
                            '-keystore', config.storeFile.absolutePath,
                            '-alias', config.keyAlias,
                            '-storepass', config.storePassword].execute()
                proc.waitFor()
                proc.in.eachLine { line ->
                    if (line.contains('SHA1:') || line.contains('SHA-256:') || line.contains('SHA256:')) {
                        println line.trim()
                    }
                }
            }
        }
    }
}

afterEvaluate {
    tasks.matching { it.name == 'assembleRelease' || it.name == 'bundleRelease' }.all { task ->
        task.finalizedBy 'printSigningSha'
    }
}
`;

    content = content.replace(
      /(repositories\s*\{)/,
      `${PRINT_SHA_TASK}\n$1`
    );
  }

  writeFileSync(buildGradlePath, content, 'utf8');
  console.log('  ✔ Patched app/build.gradle (with keystore signing config)');
}

function patchAndroidManifest() {
  const manifestPath = join(androidDir, 'app', 'src', 'main', 'AndroidManifest.xml');
  if (!existsSync(manifestPath)) return;

  let content = readFileSync(manifestPath, 'utf8');

  if (!content.includes('android.permission.CAMERA')) {
    content = content.replace(
      '<uses-permission android:name="android.permission.INTERNET" />',
      `<uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />`
    );
  }

  writeFileSync(manifestPath, content, 'utf8');
  console.log('  ✔ Patched AndroidManifest.xml');
}

function patchMainActivity() {
  const appPackagePath = APP_ID.replace(/\./g, '/');
  const templatePackagePath = TEMPLATE_PACKAGE.replace(/\./g, '/');

  const oldJavaDir = join(androidDir, 'app', 'src', 'main', 'java', ...templatePackagePath.split('/'));
  const newJavaDir = join(androidDir, 'app', 'src', 'main', 'java', ...appPackagePath.split('/'));

  if (existsSync(oldJavaDir) && !existsSync(newJavaDir)) {
    mkdirSync(newJavaDir, { recursive: true });

    const mainActivityPath = join(oldJavaDir, 'MainActivity.java');
    if (existsSync(mainActivityPath)) {
      let content = readFileSync(mainActivityPath, 'utf8');
      content = content.replace(
        new RegExp(TEMPLATE_PACKAGE.replace(/\./g, '\\.'), 'g'),
        APP_ID
      );
      writeFileSync(join(newJavaDir, 'MainActivity.java'), content, 'utf8');
    }

    const oldTestDir = join(androidDir, 'app', 'src', 'androidTest', 'java', ...templatePackagePath.split('/'));
    const newTestDir = join(androidDir, 'app', 'src', 'androidTest', 'java', ...appPackagePath.split('/'));
    if (existsSync(oldTestDir)) {
      mkdirSync(newTestDir, { recursive: true });
      const files = readdirSync(oldTestDir);
      for (const file of files) {
        let content = readFileSync(join(oldTestDir, file), 'utf8');
        content = content.replace(
          new RegExp(TEMPLATE_PACKAGE.replace(/\./g, '\\.'), 'g'),
          APP_ID
        );
        writeFileSync(join(newTestDir, file), content, 'utf8');
      }
    }

    const oldUnitTestDir = join(androidDir, 'app', 'src', 'test', 'java', ...templatePackagePath.split('/'));
    const newUnitTestDir = join(androidDir, 'app', 'src', 'test', 'java', ...appPackagePath.split('/'));
    if (existsSync(oldUnitTestDir)) {
      mkdirSync(newUnitTestDir, { recursive: true });
      const files = readdirSync(oldUnitTestDir);
      for (const file of files) {
        let content = readFileSync(join(oldUnitTestDir, file), 'utf8');
        content = content.replace(
          new RegExp(TEMPLATE_PACKAGE.replace(/\./g, '\\.'), 'g'),
          APP_ID
        );
        writeFileSync(join(newUnitTestDir, file), content, 'utf8');
      }
    }

    rmSync(join(androidDir, 'app', 'src', 'main', 'java', 'com', 'getcapacitor'), { recursive: true, force: true });
    rmSync(join(androidDir, 'app', 'src', 'androidTest', 'java', 'com', 'getcapacitor'), { recursive: true, force: true });
    rmSync(join(androidDir, 'app', 'src', 'test', 'java', 'com', 'getcapacitor'), { recursive: true, force: true });
  }

  console.log('  ✔ Patched MainActivity package path');
}

function patchStringsXml() {
  const stringsPath = join(androidDir, 'app', 'src', 'main', 'res', 'values', 'strings.xml');
  if (!existsSync(stringsPath)) return;

  let content = readFileSync(stringsPath, 'utf8');
  content = content.replace(/<string name="app_name">[^<]*<\/string>/, `<string name="app_name">${APP_NAME}</string>`);
  content = content.replace(/<string name="title_activity_main">[^<]*<\/string>/, `<string name="title_activity_main">${APP_NAME}</string>`);
  content = content.replace(/<string name="package_name">[^<]*<\/string>/, `<string name="package_name">${APP_ID}</string>`);
  content = content.replace(/<string name="custom_url_scheme">[^<]*<\/string>/, `<string name="custom_url_scheme">${APP_ID}</string>`);
  writeFileSync(stringsPath, content, 'utf8');
  console.log('  ✔ Patched strings.xml');
}

function ensureColorsXml() {
  const colorsPath = join(androidDir, 'app', 'src', 'main', 'res', 'values', 'colors.xml');

  if (existsSync(colorsPath)) return;

  const content = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#FF6200EE</color>
    <color name="colorPrimaryDark">#FF3700B3</color>
    <color name="colorAccent">#FF03DAC5</color>
</resources>
`;

  mkdirSync(dirname(colorsPath), { recursive: true });
  writeFileSync(colorsPath, content, 'utf8');
  console.log('  ✔ Created colors.xml');
}

function ensureCapacitorBuildGradle() {
  const capBuildGradlePath = join(androidDir, 'app', 'capacitor.build.gradle');

  const depLines = ANDROID_PLUGINS.map(p => `    implementation project(':${p.name}')`);

  const content = `
dependencies {
    implementation project(':capacitor-android')
    implementation project(':capacitor-cordova-android-plugins')
${depLines.join('\n')}
}
`.trim() + '\n';

  const existed = existsSync(capBuildGradlePath);
  writeFileSync(capBuildGradlePath, content, 'utf8');

  if (existed) {
    console.log('  ✔ Rewrote capacitor.build.gradle (removed iOS-only plugins)');
  } else {
    console.log('  ✔ Created capacitor.build.gradle');
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

    if (!content.includes('variables.gradle')) {
      content = content.replace(
        /buildscript\s*\{/,
        `apply from: "variables.gradle"\n\nbuildscript {`
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
apply from: "variables.gradle"

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
    let content = readFileSync(variablesPath, 'utf8');
    let modified = false;

    if (!content.includes('coreSplashScreenVersion')) {
      content = content.replace(
        /\}\s*$/,
        `    coreSplashScreenVersion = '1.0.1'\n}\n`
      );
      modified = true;
    }

    if (modified) {
      writeFileSync(variablesPath, content, 'utf8');
      console.log('✔ Patched variables.gradle');
    } else {
      console.log('✔ variables.gradle exists');
    }
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
    coreSplashScreenVersion = '1.0.1'
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

function cleanPluginsJson() {
  const pluginsJsonPath = join(androidDir, 'app', 'src', 'main', 'assets', 'capacitor.plugins.json');
  if (!existsSync(pluginsJsonPath)) return;

  try {
    const plugins = JSON.parse(readFileSync(pluginsJsonPath, 'utf8'));
    if (!Array.isArray(plugins)) return;

    const allowedSources = new Set();
    for (const plugin of ANDROID_PLUGINS) {
      const pluginSrcDir = join(androidDir, plugin.name, 'src', 'main', 'java');
      if (existsSync(pluginSrcDir)) {
        allowedSources.add(plugin.name);
      }
    }

    const filtered = plugins.filter(entry => {
      if (!entry.classpath) return false;

      for (const pluginName of allowedSources) {
        const pluginSrcDir = join(androidDir, pluginName, 'src', 'main', 'java');
        const classPath = entry.classpath.replace(/\./g, '/') + '.java';
        const classPathKt = entry.classpath.replace(/\./g, '/') + '.kt';

        if (existsSync(join(pluginSrcDir, classPath)) || existsSync(join(pluginSrcDir, classPathKt))) {
          return true;
        }
      }

      console.log(`  ✔ Removed plugin from capacitor.plugins.json: ${entry.classpath}`);
      return false;
    });

    if (filtered.length !== plugins.length) {
      writeFileSync(pluginsJsonPath, JSON.stringify(filtered, null, '\t'), 'utf8');
      console.log(`✔ Cleaned capacitor.plugins.json (${filtered.length} plugins kept, ${plugins.length - filtered.length} removed)`);
    }
  } catch (e) {
    console.warn('⚠ Could not parse capacitor.plugins.json:', e.message);
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
    { path: 'variables.gradle', required: true },
    { path: 'app/build.gradle', required: true },
    { path: 'app/capacitor.build.gradle', required: true },
    { path: 'app/src/main/AndroidManifest.xml', required: true },
    { path: `app/src/main/java/${APP_ID.replace(/\./g, '/')}/MainActivity.java`, required: true },
    { path: 'app/src/main/res/values/strings.xml', required: true },
    { path: 'app/src/main/res/values/styles.xml', required: true },
    { path: 'app/src/main/res/layout/activity_main.xml', required: true },
    { path: 'gradle/wrapper/gradle-wrapper.properties', required: true },
  ];

  for (const plugin of ANDROID_PLUGINS) {
    checks.push({ path: `${plugin.name}/build.gradle`, required: true });
  }

  let hasErrors = false;
  for (const check of checks) {
    const fullPath = join(androidDir, check.path);
    const exists = existsSync(fullPath);
    const icon = exists ? '✔' : '✖';
    const label = exists ? 'OK' : 'MISSING';
    console.log(`  ${icon} ${check.path} — ${label}`);
    if (!exists) hasErrors = true;
  }

  if (hasErrors) {
    console.error('\n✖ Some required files are missing. Check errors above.');
    process.exit(1);
  }

  console.log('');
}

try {
  console.log('=== Fixing Android Capacitor build ===\n');

  console.log('--- Step 1: Copy native modules ---');
  copyCapacitorAndroid();
  patchBridgeOverScroll();
  copyPlugins();

  console.log('\n--- Step 2: Ensure app module ---');
  ensureAppModule();

  console.log('\n--- Step 3: Ensure supporting files ---');
  ensureCordovaPlugins();
  ensureRootBuildGradle();
  ensureVariablesGradle();
  ensureGradleProperties();
  ensureGradleWrapper();

  console.log('\n--- Step 4: Configure Gradle project ---');
  writeSettingsGradle();
  cleanCapacitorBuildGradle();
  cleanPluginsJson();

  validateStructure();

  console.log('✔ Android build is complete — ready for Android Studio APK build');
} catch (error) {
  console.error('Failed to fix capacitor build:', error.message);
  process.exit(1);
}
