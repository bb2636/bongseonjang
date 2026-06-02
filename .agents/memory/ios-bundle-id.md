---
name: iOS/Android bundle identifiers
description: Correct app identifiers — the iOS bundle ID is the "seong" (double-g) spelling, which is easy to misread
---

# Correct identifiers (verified from Apple Developer Portal + App Store Connect screenshots)
- **iOS bundle ID (Developer Portal Identifier + App Store Connect record + Xcode target)**: `com.bongseongjang.app` — spelling **"bongseongjang"** (note `seong`, the double-g look). This is the ONLY identifier registered in the Developer Portal, so it is the only one Xcode can sign.
- **Android applicationId**: `com.bongkru.app` (independent; set in android build.gradle + fix-capacitor-paths.js; do NOT change).
- **capacitor.config.ts appId**: `com.bongkru.app` (shared default; iOS bundle ID is overridden by fix-ios-native.js BUNDLE_ID).
- **App custom URL scheme**: `bongseonjang` (single-g, `seon`) — this is the OAuth/deeplink scheme and is INTENTIONALLY a different spelling from the bundle ID. Do not "fix" it to match the bundle ID.
- **Production API domain**: `bongseonjang--*.replit.app` (single-g) — also independent of the bundle ID.
- **App Store Connect**: Apple ID 6774106668, SKU `com.bongkru.app`, Team `Bongseonjang Co., Ltd.` (Team ID 2SH73JWUFB).

# The seon/seong spelling trap
**Why:** The bundle ID uses `seong` (com.bongseongjang.app) while almost everything else in the repo (URL scheme, API domain) uses `seon` (bongseonjang). The two single-letter-different strings are extremely easy to misread, even from screenshots. An attempt to "unify" the bundle ID to the `seon` spelling broke signing: Xcode reported `com.bongseonjang.app` as "not available / no profiles" because no such Identifier exists in the portal — only the `seong` one does.
**How to apply:** iOS bundle ID is ALWAYS `com.bongseongjang.app` (seong, double-g). fix-ios-native.js `BUNDLE_ID` must stay `com.bongseongjang.app`; it patches both the Info.plist URL scheme block and `PRODUCT_BUNDLE_IDENTIFIER` in project.pbxproj. Never change it to the seon spelling. If an archive upload fails with "app record was previously removed", that is an App Store Connect record-state issue (restore/recreate the app record), NOT a spelling problem.
