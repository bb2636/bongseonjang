---
name: Android Capacitor WebView scroll
description: Why Android scroll uses viewport/document scroll (not body overflow:auto), and the overflow-propagation trap that caused a Google Play "can't scroll" rejection
---

# Android Capacitor WebView scroll model

On Android (`html.platform-android body.capacitor-app`), let the **viewport/document scroll naturally**: keep `body` and `#root` at `overflow: visible` with non-fixed positioning, and put horizontal clipping on `html.platform-android { overflow-x: hidden }`. iOS keeps the separate pattern (`body.capacitor-app` fixed + `#root` absolute `overflow-y:auto`) — do not touch it.

**Why:** Setting `overflow-y: auto` on `body` makes `body` a scroll container, but `body` height is content-driven (only `min-height:100%`), so overflow propagation breaks on some Android WebView versions and the page becomes completely unscrollable. This caused a Google Play "broken functionality – app not responding / can't scroll" rejection.

**Trap to avoid:** mixed-axis overflow — `overflow-x: hidden` + `overflow-y: visible` on the same element computes the visible axis to `auto`, recreating a body scroller. That's why `overflow-x:hidden` lives on `html`, not on `body`, on Android.

**How to apply:** Any page whose root container is a fixed-height scroller (`height: 100vh; overflow-y: auto`, e.g. `.brand-products-page`) must be released on Android (`height: auto; overflow: visible`) or added to the `html.platform-android` override list, or it traps page scroll. After CSS changes, rebuild via `npm run cap:build` then rebuild the AAB.
