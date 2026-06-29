---
name: InAppBrowser bottom inset (NicePay payment)
description: Android 15 edge-to-edge hides bottom buttons of pages opened in @capgo/inappbrowser openWebView; enable enabledSafeBottomMargin
---

On Android 15+ (Capacitor targets SDK 35) edge-to-edge is forced. Pages opened via
`@capgo/inappbrowser` `openWebView` (e.g. the NicePay payment page) draw behind the
navigation bar, so their bottom buttons get hidden under the system nav bar.

**Rule:** pass `enabledSafeBottomMargin: true` to every `InAppBrowser.openWebView`
call that loads a page we don't control (payment, third-party).

**Why:** the option's TS doc claims a fixed "20px" bottom margin, but the native
Android impl (`WebViewDialog.applyInsets`) actually sets
`bottomMargin = max(navBottom, ime.bottom)` where `navBottom = getEnabledSafeMargin() ? bars.bottom : 0`.
So it applies the *real* system navigation-bar inset (and grows for the keyboard),
which is exactly what's needed — don't trust the "20px" doc.

**How to apply:** used in payment flows (CheckoutPage + GuestCheckoutPage) where the
NicePay page is shown. JS-only change; the bundled plugin already supports it, but a
`cap:build` + reinstall is required to see it on device. iOS unaffected.
