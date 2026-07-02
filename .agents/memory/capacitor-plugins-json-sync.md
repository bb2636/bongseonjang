---
name: capacitor.plugins.json regenerated from node_modules
description: why "X plugin is not implemented on android/ios" happens even when module dirs and gradle look correct
---

# cap sync rebuilds capacitor.plugins.json from installed node_modules

`npx cap sync` (run inside `npm run cap:build`) regenerates the runtime plugin
registry `app/src/main/assets/capacitor.plugins.json` by scanning which Capacitor
plugins are actually installed under the build machine's `node_modules`. If a plugin
is missing or half-installed there, cap sync **silently drops it** from that JSON.

**Symptom:** at runtime the app throws `"<PluginName>" plugin is not implemented on
android` (or ios) — e.g. `InAppBrowser` — even though the module dir
(`android/capgo-inappbrowser`), `settings.gradle`, `capacitor.build.gradle`, and the
Java sources are all present and correct. For 봉선장 this breaks NicePay payment window
AND all social logins (Kakao/Naver/Google) at once, because they all open via
`@capgo/inappbrowser`.

**Why:** the module compiling into the APK is necessary but NOT sufficient — Capacitor
only registers plugin classes listed in `capacitor.plugins.json` at startup. A broken
npm install (see the package-lock internal-URL / ENOTEMPTY issues on external machines)
leaves the plugin out of node_modules, so cap sync omits it.

**How to apply / fix:**
1. Get a clean, COMPLETE dependency install first (on external machines the committed
   package-lock.json points at `package-firewall.replit.local` and hangs — delete it:
   `rm -rf node_modules package-lock.json && npm install`).
2. Confirm the plugin is really installed: `ls node_modules/@capgo/inappbrowser`.
3. Run `cap:build`, then VERIFY the registry actually lists it:
   grep `@capgo/inappbrowser` in
   `apps/frontend/android/app/src/main/assets/capacitor.plugins.json`
   (and the iOS equivalent). If it's missing, node_modules is still broken — stop and fix.
4. Android Studio: Build > Clean, rebuild, then UNINSTALL the old app on the device
   before installing the fresh build (stale APKs also show this exact error).

Watch for version drift: package.json pinned `@capgo/inappbrowser ^7.x` but a tangled
install pulled 8.x — a sign the lockfile/install is not trustworthy.
