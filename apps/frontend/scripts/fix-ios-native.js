import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRONTEND_DIR = path.join(__dirname, '..');
const IOS_APP_DIR = path.join(FRONTEND_DIR, 'ios/App/App');
const PLIST_PATH = path.join(IOS_APP_DIR, 'Info.plist');
const ENTITLEMENTS_PATH = path.join(IOS_APP_DIR, 'App.entitlements');
const APPICONSET_DIR = path.join(IOS_APP_DIR, 'Assets.xcassets', 'AppIcon.appiconset');
const ICON_SOURCE = path.join(FRONTEND_DIR, 'resources', 'icon.png');

function checkiOSProjectExists() {
  if (!fs.existsSync(IOS_APP_DIR)) {
    console.log('iOS project not found. Run "npx cap add ios" first. Skipping.');
    process.exit(0);
  }
}

const PRIVACY_DESCRIPTIONS = {
  NSPhotoLibraryUsageDescription: '상품 문의 및 리뷰 작성 시 사진을 첨부하기 위해 사진 라이브러리 접근 권한이 필요합니다.',
  NSCameraUsageDescription: '상품 문의 및 리뷰 작성 시 사진을 촬영하기 위해 카메라 접근 권한이 필요합니다.',
  NSPhotoLibraryAddUsageDescription: '촬영한 사진을 저장하기 위해 사진 라이브러리 저장 권한이 필요합니다.',
  NSFaceIDUsageDescription: '안전한 결제를 위해 Face ID 인증이 필요합니다.',
  NSUserTrackingUsageDescription: '더 나은 서비스 제공을 위해 앱 사용 데이터를 수집합니다. 수집된 데이터는 서비스 개선 목적으로만 사용됩니다.',
  NSMicrophoneUsageDescription: '동영상 촬영 시 오디오 녹음을 위해 마이크 접근 권한이 필요합니다.',
  NSLocationWhenInUseUsageDescription: '주변 매장 검색 및 배송지 설정을 위해 위치 정보가 필요합니다.',
  ITSAppUsesNonExemptEncryption: 'false'
};

const URL_SCHEME = 'bongseonjang';
const BUNDLE_ID = 'com.bongkru.app';

function fixInfoPlist() {
  console.log('\n=== Info.plist ===');

  if (!fs.existsSync(PLIST_PATH)) {
    console.log('Info.plist not found. Skipping.');
    return;
  }

  let content = fs.readFileSync(PLIST_PATH, 'utf8');
  let addedCount = 0;

  for (const [key, value] of Object.entries(PRIVACY_DESCRIPTIONS)) {
    if (!content.includes(`<key>${key}</key>`)) {
      const insertPoint = findRootDictEnd(content);
      if (insertPoint === -1) {
        console.error('Invalid Info.plist format');
        process.exit(1);
      }

      let newEntry;
      if (value === 'true' || value === 'false') {
        newEntry = `\t<key>${key}</key>\n\t<${value}/>\n`;
      } else {
        newEntry = `\t<key>${key}</key>\n\t<string>${value}</string>\n`;
      }

      content = content.slice(0, insertPoint) + newEntry + content.slice(insertPoint);
      console.log(`  Added: ${key}`);
      addedCount++;
    }
  }

  content = ensureUrlScheme(content);

  fs.writeFileSync(PLIST_PATH, content, 'utf8');
  console.log(`  Total privacy keys added: ${addedCount}`);
}

function findRootDictEnd(plistContent) {
  const plistEnd = plistContent.lastIndexOf('</plist>');
  if (plistEnd === -1) return -1;

  const searchArea = plistContent.slice(0, plistEnd);
  const lastDictEnd = searchArea.lastIndexOf('</dict>');
  return lastDictEnd;
}

function ensureUrlScheme(content) {
  if (content.includes(`<string>${URL_SCHEME}</string>`)) {
    console.log(`  URL scheme "${URL_SCHEME}" already exists.`);
    return content;
  }

  if (content.includes('<key>CFBundleURLTypes</key>')) {
    const urlTypesStart = content.indexOf('<key>CFBundleURLTypes</key>');
    const arrayStart = content.indexOf('<array>', urlTypesStart);
    if (arrayStart !== -1) {
      const insertAfter = arrayStart + '<array>'.length;
      const newUrlType = `\n\t\t<dict>\n\t\t\t<key>CFBundleURLName</key>\n\t\t\t<string>${BUNDLE_ID}</string>\n\t\t\t<key>CFBundleURLSchemes</key>\n\t\t\t<array>\n\t\t\t\t<string>${URL_SCHEME}</string>\n\t\t\t</array>\n\t\t</dict>`;
      content = content.slice(0, insertAfter) + newUrlType + content.slice(insertAfter);
      console.log(`  Appended URL scheme "${URL_SCHEME}" to existing CFBundleURLTypes.`);
    }
  } else {
    const insertPoint = findRootDictEnd(content);
    if (insertPoint !== -1) {
      const urlSchemeEntry = `\t<key>CFBundleURLTypes</key>\n\t<array>\n\t\t<dict>\n\t\t\t<key>CFBundleURLName</key>\n\t\t\t<string>${BUNDLE_ID}</string>\n\t\t\t<key>CFBundleURLSchemes</key>\n\t\t\t<array>\n\t\t\t\t<string>${URL_SCHEME}</string>\n\t\t\t</array>\n\t\t</dict>\n\t</array>\n`;
      content = content.slice(0, insertPoint) + urlSchemeEntry + content.slice(insertPoint);
      console.log(`  Added CFBundleURLTypes with scheme "${URL_SCHEME}".`);
    }
  }

  return content;
}

function fixEntitlements() {
  console.log('\n=== App.entitlements (Sign in with Apple) ===');

  const entitlementsContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>com.apple.developer.applesignin</key>
\t<array>
\t\t<string>Default</string>
\t</array>
</dict>
</plist>
`;

  if (fs.existsSync(ENTITLEMENTS_PATH)) {
    const existing = fs.readFileSync(ENTITLEMENTS_PATH, 'utf8');
    if (existing.includes('com.apple.developer.applesignin')) {
      console.log('  Sign in with Apple already configured.');
      return;
    }

    const insertPoint = existing.lastIndexOf('</dict>');
    if (insertPoint !== -1) {
      const appleSignInEntry = `\t<key>com.apple.developer.applesignin</key>\n\t<array>\n\t\t<string>Default</string>\n\t</array>\n`;
      const updated = existing.slice(0, insertPoint) + appleSignInEntry + existing.slice(insertPoint);
      fs.writeFileSync(ENTITLEMENTS_PATH, updated, 'utf8');
      console.log('  Added Sign in with Apple to existing entitlements.');
    }
  } else {
    fs.writeFileSync(ENTITLEMENTS_PATH, entitlementsContent, 'utf8');
    console.log('  Created App.entitlements with Sign in with Apple.');
  }
}

function fixSwiftFiles() {
  console.log('\n=== Swift files (SwipeBack + ViewController) ===');

  createBridgeViewController();
  updateSceneDelegate();
  removeOldSwipeBackFiles();
  cleanAppDelegate();
}

function createBridgeViewController() {
  const filePath = path.join(IOS_APP_DIR, 'BridgeViewController.swift');
  const content = `import UIKit
import Capacitor

class BridgeViewController: CAPBridgeViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        bridge?.webView?.allowsBackForwardNavigationGestures = true
    }
}
`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('  Created/Updated BridgeViewController.swift');
}

function updateSceneDelegate() {
  const sceneDelegatePath = path.join(IOS_APP_DIR, 'SceneDelegate.swift');
  if (!fs.existsSync(sceneDelegatePath)) {
    console.log('  SceneDelegate.swift not found. Skipping.');
    return;
  }

  let content = fs.readFileSync(sceneDelegatePath, 'utf8');

  if (content.includes('BridgeViewController')) {
    console.log('  SceneDelegate already uses BridgeViewController.');
    return;
  }

  if (content.includes('CAPBridgeViewController')) {
    content = content.replace(/CAPBridgeViewController\s*\(\s*\)/g, 'BridgeViewController()');
    fs.writeFileSync(sceneDelegatePath, content, 'utf8');
    console.log('  Replaced CAPBridgeViewController with BridgeViewController in SceneDelegate.');
    return;
  }

  const rootVcPattern = /\.rootViewController\s*=\s*\w+\(\)/g;
  if (rootVcPattern.test(content)) {
    content = content.replace(/\.rootViewController\s*=\s*\w+\(\)/, '.rootViewController = BridgeViewController()');
    fs.writeFileSync(sceneDelegatePath, content, 'utf8');
    console.log('  Replaced rootViewController with BridgeViewController in SceneDelegate.');
    return;
  }

  console.log('  Could not auto-update SceneDelegate. Please manually set:');
  console.log('    window.rootViewController = BridgeViewController()');
}

function removeOldSwipeBackFiles() {
  const problematicNames = [
    'iosSwipeBack.swift',
    'IoSwipeBack.swift',
    'SwipeBack.swift',
    'SwipeBackPlugin.swift'
  ];

  for (const name of problematicNames) {
    const filePath = path.join(IOS_APP_DIR, name);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`  Removed problematic file: ${name}`);
    }
  }
}

function cleanAppDelegate() {
  const appDelegatePath = path.join(IOS_APP_DIR, 'AppDelegate.swift');
  if (!fs.existsSync(appDelegatePath)) {
    return;
  }

  let content = fs.readFileSync(appDelegatePath, 'utf8');
  let changed = false;

  const patterns = [
    /^.*\biosSwipeBack\b.*$/gm,
    /^.*\bIoSwipeBack\b.*$/gm,
    /^.*\bSwipeBackPlugin\b.*$/gm
  ];

  for (const pattern of patterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, '');
      changed = true;
    }
  }

  if (changed) {
    content = content.replace(/\n{3,}/g, '\n\n');
    fs.writeFileSync(appDelegatePath, content, 'utf8');
    console.log('  Cleaned SwipeBack references from AppDelegate.swift');
  }
}

function printEntitlementsReminder() {
  console.log('\n=== Note ===');
  console.log('  First build only: In Xcode, add "Sign in with Apple" capability');
  console.log('  (App target > Signing & Capabilities > + Capability)');
}

function fixAppIcon() {
  console.log('\n=== App Icon ===');

  if (!fs.existsSync(ICON_SOURCE)) {
    console.log('  resources/icon.png not found. Skipping icon setup.');
    return;
  }

  if (!fs.existsSync(APPICONSET_DIR)) {
    fs.mkdirSync(APPICONSET_DIR, { recursive: true });
  }

  const iconDest = path.join(APPICONSET_DIR, 'AppIcon-1024.png');
  fs.copyFileSync(ICON_SOURCE, iconDest);
  console.log('  Copied icon.png → AppIcon-1024.png (1024x1024)');

  const contentsJson = {
    images: [
      {
        filename: 'AppIcon-1024.png',
        idiom: 'universal',
        platform: 'ios',
        scale: '1x',
        size: '1024x1024'
      }
    ],
    info: {
      author: 'xcode',
      version: 1
    }
  };

  fs.writeFileSync(
    path.join(APPICONSET_DIR, 'Contents.json'),
    JSON.stringify(contentsJson, null, 2),
    'utf8'
  );
  console.log('  Created Contents.json for AppIcon.appiconset');
}

console.log('=== iOS Native Fix Script ===');
checkiOSProjectExists();
fixAppIcon();
fixInfoPlist();
fixEntitlements();
fixSwiftFiles();
printEntitlementsReminder();
console.log('\nAll iOS native fixes applied successfully!');
