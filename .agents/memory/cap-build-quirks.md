---
name: cap:build environment quirks
description: How to run the long Capacitor android build in this sandbox and what failure is harmless
---

## Running long builds (>2 min) in this sandbox
The bash tool kills any process it spawned (incl. nohup/setsid-detached) when the
tool call returns or times out (exit 143 / SIGTERM). A foreground bash call caps at
~120s, which is shorter than `cap:build`.

**How to apply:** run long builds via a temporary Replit workflow
(`configureWorkflow` outputType "console", no waitForPort), poll `getWorkflowStatus`
until state finished/failed, then `removeWorkflow`. Do NOT rely on bash background jobs.

## `npm run cap:build` "assets" step failure is harmless
`cap:build` = vite build (capacitor mode) -> cap:sync:android (fix-capacitor-paths.js)
-> assets (icon/splash gen). The final `assets` step fails because the `sharp` native
module is broken (`Cannot find module sharp-linux-x64.node`).

**Why:** that step only regenerates app icons/splash (cosmetic, already generated
before). The two steps that matter — the web bundle and the synced android project —
complete BEFORE it. A non-zero exit here does NOT mean the android project is unusable.

**How to apply:** after cap:build, verify success by checking the synced bundle has the
right baked API URL (grep android/app/src/main/assets/public/assets for the prod domain,
confirm no stale dev domain) rather than trusting the npm exit code.
