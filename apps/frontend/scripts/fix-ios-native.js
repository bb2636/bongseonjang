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
  ITSAppUsesNonExemptEncryption: 'false'
};

const URL_SCHEME = 'bongseonjang';
const BUNDLE_ID = 'com.bongseongjang.app';

const PAYMENT_APP_SCHEMES = [
  'kftc-bankpay',
  'ispmobile',
  'shinhan-sr-ansimclick',
  'kb-acp',
  'kb-bankpay',
  'liivbank',
  'kbstar',
  'newliiv',
  'com.kbcard.cxh.appcard',
  'hdcardappcardansimclick',
  'smhyundaiansimclick',
  'lotteappcard',
  'lottesmartpay',
  'cloudpay',
  'nhappcardansimclick',
  'nhallonepayansimclick',
  'nonghyupcardansimclick',
  'nhallonepayhansimclick',
  'citimobileapp',
  'ciaborncardansimclick',
  'mpocket.online.ansimclick',
  'wooripay',
  'com.wooricard.wcard',
  'newsmartpib',
  'supertoss',
  'kakaotalk',
  'payco',
  'lpayapp',
  'naverbankauth',
  'naverscheme',
  'samsungpay',
  'scardcertiapp',
  'ansimclickscard',
  'ansimclickipcollect',
  'vguardstart',
  'shinsaborncardansimclick',
  'haborncardansimclick',
  'hanaborncardansimclick',
  'hanawalletmembers',
  'tswansimclick',
  'taaborncardansimclick',
  'chaaborncardansimclick',
  'laborncardansimclick',
  'lguthepay-xpay',
  'ukbanksmartbanknonloginpay',
  'com.ssg.serviceapp.android.egiftcertificate',
  'uppay',
  'nice_payments',
  'nicepay-auth',
  'itms-apps',
];

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
  content = ensurePaymentAppSchemes(content);

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

function ensurePaymentAppSchemes(content) {
  if (content.includes('<key>LSApplicationQueriesSchemes</key>')) {
    const keyStart = content.indexOf('<key>LSApplicationQueriesSchemes</key>');
    const arrayStart = content.indexOf('<array>', keyStart);
    const arrayEnd = content.indexOf('</array>', arrayStart);
    if (arrayStart !== -1 && arrayEnd !== -1) {
      const existingBlock = content.slice(arrayStart, arrayEnd);
      let schemesAdded = 0;
      let insertAt = arrayEnd;
      for (const scheme of PAYMENT_APP_SCHEMES) {
        if (!existingBlock.includes(`<string>${scheme}</string>`)) {
          const entry = `\t\t<string>${scheme}</string>\n`;
          content = content.slice(0, insertAt) + entry + content.slice(insertAt);
          insertAt += entry.length;
          schemesAdded++;
        }
      }
      if (schemesAdded > 0) {
        console.log(`  Added ${schemesAdded} payment app schemes to existing LSApplicationQueriesSchemes.`);
      } else {
        console.log('  LSApplicationQueriesSchemes already has all payment schemes.');
      }
    }
  } else {
    const insertPoint = findRootDictEnd(content);
    if (insertPoint !== -1) {
      const schemesEntries = PAYMENT_APP_SCHEMES.map(s => `\t\t<string>${s}</string>`).join('\n');
      const entry = `\t<key>LSApplicationQueriesSchemes</key>\n\t<array>\n${schemesEntries}\n\t</array>\n`;
      content = content.slice(0, insertPoint) + entry + content.slice(insertPoint);
      console.log(`  Added LSApplicationQueriesSchemes with ${PAYMENT_APP_SCHEMES.length} payment app schemes.`);
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
  patchInAppBrowserPaymentSchemes();
}

function patchInAppBrowserPaymentSchemes() {
  console.log('\n=== InAppBrowser Payment Scheme Patch ===');

  const possiblePaths = [
    path.join(FRONTEND_DIR, 'ios/App/Pods/CapgoInappbrowser/ios/Sources/InAppBrowserPlugin/WKWebViewController.swift'),
    path.join(FRONTEND_DIR, 'node_modules/@capgo/inappbrowser/ios/Sources/InAppBrowserPlugin/WKWebViewController.swift'),
  ];

  let swiftPath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      swiftPath = p;
      break;
    }
  }

  if (!swiftPath) {
    const iosDir = path.join(FRONTEND_DIR, 'ios');
    if (fs.existsSync(iosDir)) {
      const findResult = findFileRecursive(iosDir, 'WKWebViewController.swift');
      if (findResult) {
        swiftPath = findResult;
      }
    }
  }

  if (!swiftPath) {
    console.log('  WKWebViewController.swift not found. Skipping InAppBrowser patch.');
    return;
  }

  let content = fs.readFileSync(swiftPath, 'utf8');
  let patchCount = 0;

  const PATCHED_MARKER = '// [Bongseonjang] Patched tryOpenCustomScheme for Korean payment apps';

  if (content.includes(PATCHED_MARKER)) {
    console.log('  tryOpenCustomScheme already fully patched.');
    return;
  }

  const originalFuncRegex = /private func tryOpenCustomScheme\(_ url: URL\) -> Bool \{[\s\S]*?\n    \}/;
  const match = content.match(originalFuncRegex);

  if (match) {
    const replacementFunc = `private func tryOpenCustomScheme(_ url: URL) -> Bool {
        ${PATCHED_MARKER}
        let app = UIApplication.shared

        if app.canOpenURL(url) {
            print("[InAppBrowser] canOpenURL succeeded for: \\(url.scheme ?? "")")
            app.open(url, options: [:]) { success in
                print("[InAppBrowser] open result for \\(url.scheme ?? ""): \\(success)")
            }
            return true
        }

        print("[InAppBrowser] canOpenURL failed for: \\(url.scheme ?? ""). Attempting direct open...")
        app.open(url, options: [:]) { success in
            if success {
                print("[InAppBrowser] Direct open succeeded for: \\(url.scheme ?? "")")
            } else {
                print("[InAppBrowser] Direct open also failed for: \\(url.scheme ?? "")")
            }
        }
        return true
    }`;

    content = content.replace(originalFuncRegex, replacementFunc);
    patchCount++;
    console.log('  Replaced tryOpenCustomScheme with enhanced payment app handler.');
  } else {
    console.log('  Warning: Could not find tryOpenCustomScheme function. Manual review needed.');
  }

  if (patchCount > 0) {
    fs.writeFileSync(swiftPath, content, 'utf8');
    console.log(`  Applied ${patchCount} patch(es) to WKWebViewController.swift`);
  }
}

function findFileRecursive(dir, filename) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git') continue;
        const result = findFileRecursive(fullPath, filename);
        if (result) return result;
      } else if (entry.name === filename) {
        return fullPath;
      }
    }
  } catch {
  }
  return null;
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

  const sceneDelegateContent = `import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?
    private let privacyScreenTag = 99999

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }
        let window = UIWindow(windowScene: windowScene)
        window.rootViewController = BridgeViewController()
        self.window = window
        window.makeKeyAndVisible()
    }

    func sceneWillResignActive(_ scene: UIScene) {
        guard let window = self.window else { return }
        if window.viewWithTag(privacyScreenTag) != nil { return }

        let coverView = UIView(frame: window.bounds)
        coverView.tag = privacyScreenTag
        coverView.backgroundColor = .white
        coverView.autoresizingMask = [.flexibleWidth, .flexibleHeight]

        let iconSize: CGFloat = 80
        let iconImageView = UIImageView(frame: CGRect(
            x: (window.bounds.width - iconSize) / 2,
            y: (window.bounds.height - iconSize) / 2,
            width: iconSize,
            height: iconSize
        ))
        iconImageView.autoresizingMask = [
            .flexibleTopMargin, .flexibleBottomMargin,
            .flexibleLeftMargin, .flexibleRightMargin
        ]
        iconImageView.contentMode = .scaleAspectFit
        iconImageView.layer.cornerRadius = 16
        iconImageView.clipsToBounds = true

        if let appIcon = UIImage(named: "AppIcon") {
            iconImageView.image = appIcon
        } else if let iconsDictionary = Bundle.main.infoDictionary?["CFBundleIcons"] as? [String: Any],
                  let primaryIconsDictionary = iconsDictionary["CFBundlePrimaryIcon"] as? [String: Any],
                  let iconFiles = primaryIconsDictionary["CFBundleIconFiles"] as? [String],
                  let lastIcon = iconFiles.last {
            iconImageView.image = UIImage(named: lastIcon)
        }

        coverView.addSubview(iconImageView)
        window.addSubview(coverView)
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
        guard let window = self.window,
              let coverView = window.viewWithTag(privacyScreenTag) else { return }
        UIView.animate(withDuration: 0.2, animations: {
            coverView.alpha = 0
        }) { _ in
            coverView.removeFromSuperview()
        }
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        guard let url = URLContexts.first?.url else { return }
        NotificationCenter.default.post(name: .capacitorOpenURL, object: [
            "url": url
        ])
    }
}
`;

  fs.writeFileSync(sceneDelegatePath, sceneDelegateContent, 'utf8');
  console.log('  Created SceneDelegate.swift with BridgeViewController + privacy screen.');
}

function removeOldSwipeBackFiles() {
  const problematicNames = [
    'iosSwipeBack.swift',
    'IoSwipeBack.swift',
    'SwipeBack.swift',
    'SwipeBackPlugin.swift',
    'IosSwipeBack.swift',
    'iosSwipeBackPlugin.swift'
  ];

  for (const name of problematicNames) {
    const filePath = path.join(IOS_APP_DIR, name);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`  Removed file: ${name}`);
    }
  }

  removeSwipeBackFromPbxproj();
  setBundleIdentifierInPbxproj();
}

function setBundleIdentifierInPbxproj() {
  const pbxprojPath = path.join(FRONTEND_DIR, 'ios', 'App', 'App.xcodeproj', 'project.pbxproj');
  if (!fs.existsSync(pbxprojPath)) {
    return;
  }

  let content = fs.readFileSync(pbxprojPath, 'utf8');
  const bundleIdPattern = /PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g;

  if (!bundleIdPattern.test(content)) {
    console.log('  PRODUCT_BUNDLE_IDENTIFIER not found in project.pbxproj');
    return;
  }

  content = content.replace(bundleIdPattern, `PRODUCT_BUNDLE_IDENTIFIER = ${BUNDLE_ID};`);
  fs.writeFileSync(pbxprojPath, content, 'utf8');
  console.log(`  Set PRODUCT_BUNDLE_IDENTIFIER to ${BUNDLE_ID} in project.pbxproj`);
}

function removeSwipeBackFromPbxproj() {
  const pbxprojPath = path.join(FRONTEND_DIR, 'ios', 'App', 'App.xcodeproj', 'project.pbxproj');
  if (!fs.existsSync(pbxprojPath)) {
    return;
  }

  let content = fs.readFileSync(pbxprojPath, 'utf8');
  const originalLength = content.length;

  const swipeBackPatterns = [
    /^.*[Ss]wipe[Bb]ack.*\n/gm,
    /^.*iosSwipeBack.*\n/gm,
    /^.*IoSwipeBack.*\n/gm,
    /^.*IosSwipeBack.*\n/gm,
    /^.*SwipeBackPlugin.*\n/gm
  ];

  for (const pattern of swipeBackPatterns) {
    content = content.replace(pattern, '');
  }

  if (content.length !== originalLength) {
    fs.writeFileSync(pbxprojPath, content, 'utf8');
    console.log('  Removed SwipeBack references from project.pbxproj');
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
