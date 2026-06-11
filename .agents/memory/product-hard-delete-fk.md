---
name: Product hard delete FK chain
description: Why deleting a product can 500, and which child tables must be cleared first
---

# Product hard delete FK chain

Admin product delete is a HARD delete. Two relations to `products` use `NO ACTION`
(`reviews.productId`, `product_inquiries.product_id`), so deleting a product that
has any review or inquiry fails with an FK violation → 500.

**Why:** Most product child relations cascade or null at the DB level
(`product_options`/`product_images`/`product_exposure_categories`/`cart_items`/
`wishlist_items`/`time_deals` = CASCADE; `order_items` = SET NULL to preserve
order history; `review_images` = CASCADE from `reviews`). Only `reviews` and
`product_inquiries` block, because they are NO ACTION.

**How to apply:** When hard-deleting a product, delete `reviews` and
`product_inquiries` for that product first, inside a transaction, before deleting
the product. If a future relation to `products` is added with NO ACTION, it must
be added to this cleanup or delete will 500 again. Auditing FK delete_rules
against `products` is the fast way to find such blockers.
