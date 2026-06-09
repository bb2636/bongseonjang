---
name: Capacitor cold-start performance
description: What actually slows native (Capacitor) app launch here and how to avoid it
---

For this app the backend home endpoints are fast (`/home/above-fold` ~1-22ms, 778B). Cold-start lag came from **external network dependencies and bundle parse**, not data.

**Rule 1 — bundle fonts locally, never from a CDN.** The app previously loaded Pretendard from jsdelivr as a render-blocking `<link>`, so on every launch text waited on an external request. Fix: ship `PretendardVariable.woff2` in `apps/frontend/public/fonts/`, declare `@font-face` (`format('woff2')` + `font-weight: 45 920` for the variable axis, `font-display: swap`), and `<link rel="preload" as="font" crossorigin>` it. Absolute `/fonts/...` paths resolve in Capacitor the same way `/assets/...` does (Vite base is `/`).
**Why:** a native app should not need the internet to render its own UI font.

**Rule 2 — `fetchpriority` must be lowercase in React 18.x.** camelCase `fetchPriority` triggers "React does not recognize the prop" warning here (React 18.3.1). camelCase is only honored in React 19. Use lowercase `fetchpriority` until the React 19 upgrade.

**Note on vendor splitting:** `manualChunks` (react-vendor / swiper-vendor / query-vendor) helps web caching but does NOT reduce total parse cost for Capacitor (assets are local files), so don't expect big native cold-start wins from chunk splitting alone — the font fix is the high-impact lever.

**Note:** the React splash (`SplashContext`) hides when above-fold *data* resolves (cap 5s), not when hero *images* finish — so image weight still affects perceived readiness; first hero `<img>` uses `loading="eager"` + `fetchpriority="high"`.
