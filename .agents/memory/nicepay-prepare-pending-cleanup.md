---
name: NicePay prepare/pending order cleanup
description: Why pending orders leak from the checkout prepare step and which failure paths the frontend cleanup must cover
---

# NicePay prepare → pending order cleanup

The checkout `prepare` step creates the order (`status='pending'`) + orderItems + payment(`pending`) **before** the NicePay payment window opens. The order only becomes `paid` after a successful payment. So any failure between prepare and payment leaves an orphan pending order.

Frontend cleanup calls `POST /payment/log-error` with `{ deleteOrder: true, deletionToken }` (optionalAuth: guest needs the token, member can use it too). Backend `deletePendingOrder` only deletes when `status==='pending'`.

**Rule:** the cleanup must fire on every pre-payment failure path, not just NicePay's `fnError`:
- payment module not loaded (`!window.AUTHNICE`)
- `window.AUTHNICE.requestPay(...)` throwing synchronously
- `fnError` callback

**Why:** when the payment window never opens, NicePay does NOT invoke `fnError`, so without explicit cleanup the pending order survives and shows up in order history.

**Known gap (not fixable here):** NicePay's own validation errors (e.g. clientId/허용도메인 misconfig) render an internal `alert()` and neither throw nor call `fnError` — those pending orders can't be caught by frontend cleanup. They are instead hidden by the order-history list filter (excludes `pending`/`payment_failed`/`stock_insufficient`), so keeping that filter correct + redeploying is the safety net.

**How to apply:** keep one shared helper (`paymentApi.deletePreparedOrder`) used by both CheckoutPage and GuestCheckoutPage; pass `deletionToken` through on every call site.
