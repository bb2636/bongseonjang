---
name: Production DB writes
description: How to write/provision data into the PRODUCTION database when tooling access is read-only
---

The database tooling (executeSql with environment:"production") is READ-ONLY — SELECT only, no INSERT/UPDATE/DELETE. Dev and prod are separate databases (dev had 0 users while prod had 3).

**Rule:** to create/seed data in production, do it via app-startup code, then have the user republish/deploy. There is no direct write path to the prod DB from the agent tools, and the Replit-managed prod DATABASE_URL is not readily exposed.

**Why:** prod DB credentials aren't available to the agent; the running deployment is the only process with write access to prod.

**How to apply:** add an idempotent bootstrap (check-then-insert / ON CONFLICT DO NOTHING) that runs in `startServer()` after `initializeDatabase()`/`runProductionSeed()`. Note `runProductionSeed()` early-returns when the products table is non-empty, so anything that must run on an already-populated prod DB must live OUTSIDE that guard (e.g. its own function). The admin account is provisioned this way via `seeds/ensureAdminUser.ts`.
