---
name: iOS/Android bundle identifiers
description: Correct app identifiers and the seon/seong spelling trap that broke App Store uploads
---

# Correct identifiers
- **iOS bundle ID (App Store Connect record + Developer Portal target)**: `com.bongseonjang.app` — spelling **"bongseonjang"** (single `g`, i.e. `seon` not `seong`). This matches the whole codebase (apiConfig prod domain `bongseonjang--*.replit.app`, URL scheme `bongseonjang`, vite/cap configs).
- **Android applicationId**: `com.bongkru.app` (independent, set in android build.gradle + fix-capacitor-paths.js; do NOT change to match iOS).
- **capacitor.config.ts appId**: `com.bongkru.app` (shared default; iOS bundle ID is overridden by fix-ios-native.js).
- **App Store Connect**: Apple ID 6774106668, SKU `com.bongkru.app`, Team `Bongseonjang Co., Ltd.` (Team ID 2SH73JWUFB).

# The spelling trap
**Why:** A typo variant `com.bongseongjang.app` ("bongseo**ng**jang", double-ish `g` / `seong`) was mistakenly registered as a Developer Portal Identifier and an ASC app record. The typo ASC record was later removed; the valid ASC record uses the correct `com.bongseonjang.app`. Xcode could only sign the typo ID (only that Identifier existed in the portal), but uploads require matching the valid ASC record → "app bundle not found".
**How to apply:** Always use `com.bongseonjang.app` (seon, single g). fix-ios-native.js `BUNDLE_ID` must stay `com.bongseonjang.app` and it both patches Info.plist URL scheme AND `PRODUCT_BUNDLE_IDENTIFIER` in project.pbxproj. If Xcode says the bundle ID isn't recognized, the `com.bongseonjang.app` App ID must be created in the Developer Portal (with Sign In with Apple + Push capabilities) — not the seong typo.
