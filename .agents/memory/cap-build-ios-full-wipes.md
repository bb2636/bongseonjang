---
name: cap:build:ios full wipes all node_modules
description: iOS full build is destructive to the whole monorepo's deps — never run concurrently with other builds/dev
---

# cap:build:ios "full" mode deletes ALL node_modules

`npm run cap:build:ios` runs `scripts/cap-build-ios.js full`, whose first step is
"cleaning all node_modules": it removes root `node_modules`, `package-lock.json`,
`apps/frontend/node_modules`, `apps/backend/node_modules`, then runs a fresh
`npm install` before adding/syncing the iOS platform.

**Why it matters:**
- Running it CONCURRENTLY with the Android build (`cap:build`) breaks the Android build
  mid-flight with `sh: 1: vite: not found`, because vite's binary disappears when the
  shared node_modules is wiped. The two builds MUST be serialized.
- It also pulls node_modules out from under the running dev workflows
  (`Start application`, `Backend server`). They auto-restart and recover once install
  finishes, but verify they're healthy afterward.

**How to apply:**
- Build iOS first (it reinstalls deps), THEN run the Android build, THEN verify dev
  workflows. Never run both build workflows in parallel.
- `cap:build:ios:quick` skips the node_modules clean — use it when deps are already good
  and you only changed web/native-fix code.
- Both Android and iOS bundles bake the same prod domain; verify by grepping
  `apps/frontend/{android/app/src/main/assets,ios/App/App}/public/assets` for
  `bongseonjang.replit.app`.
