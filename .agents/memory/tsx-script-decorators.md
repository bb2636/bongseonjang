---
name: tsx standalone scripts (TypeORM decorators)
description: How to run one-off backend tsx scripts that import TypeORM entities without decorator metadata crashes
---

Run any standalone backend script that imports TypeORM entities with the backend tsconfig:

`npx tsx --tsconfig apps/backend/tsconfig.json apps/backend/scripts/<file>.ts`

**Why:** tsx/esbuild defaults to the TC39 decorator transform. Without `--tsconfig` pointing at apps/backend/tsconfig.json (which sets `experimentalDecorators`+`emitDecoratorMetadata`), importing an entity throws `TypeError: Cannot read properties of undefined (reading 'constructor')` in typeorm PrimaryGeneratedColumn. Adding `import 'reflect-metadata'` alone does NOT fix it — the tsconfig flag is the real fix.

**How to apply:** Run from project root so `process.cwd()`-relative paths (e.g. a `detail-images/` upload folder) resolve at the repo root. The running dev backend uses `tsx watch --tsconfig tsconfig.json` from inside apps/backend, which is why it works there.
