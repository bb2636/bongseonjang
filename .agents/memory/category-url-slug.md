---
name: Category URL slug convention
description: How product-category URLs are addressed (Korean slug, not UUID) and how backend resolves them
---

Category pages are addressed by a **Korean slug derived from the category name**, not the UUID.

- Slug = category name with `/` replaced by `-` (e.g. `반건조/건조` → `반건조-건조`). Static tabs keep `all`/`best`/`new`.
- Frontend builds every `/category/{slug}` link via the shared helper `toCategorySlug(name)` (`apps/frontend/src/shared/utils/categorySlug.ts`). Keep all category navigation going through it.
- Backend `/products/by-category/:param` accepts **either** a UUID (used directly) **or** a slug (resolved with `REPLACE(name,'/','-') = slug`). This keeps old UUID links working.
- Admin banner "카테고리 연결" link type stores `linkUrl=/category/{slug}`; `determineLinkType` recognizes the `/category/` prefix.

**Why:** user disliked raw UUIDs showing in the address bar and wanted readable Korean URLs.
**How to apply:** when adding new category entry points, generate links with `toCategorySlug`; never hardcode UUIDs in category URLs. If you change a category name, its slug (and any saved banner link) changes too.
