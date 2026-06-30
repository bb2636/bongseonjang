---
name: vbank/finalize idempotency
description: How exactly-once order finalization is enforced for NicePay payments (card + virtual account)
---

# finalizePaidOrder idempotency

`finalizePaidOrder` (apps/backend/features/payment/routes/paymentRoutes.ts) is the single shared path that confirms an order: stock deduction, point use, coupon use, and the `order.status='paid'` / `payment.status='completed'` writes all happen inside ONE transaction.

**Rule:** the "already finalized?" gate and the locking MUST be inside the transaction, never a pre-check before it.
- Lock the `Order` and `Payment` rows with `setLock('pessimistic_write')` at the start of the transaction.
- Re-check `order.status==='paid' || payment.status==='completed'` inside the lock; if so return `alreadyFinalized` and mutate nothing.
- Only the NicePay cancel + failed-status writes (stock-insufficient / order-not-found path) run outside the transaction, by re-fetching.
- `cartItemIdsSnapshot` is returned out of the transaction so cart cleanup happens after commit.

**Why:** vbank deposit is confirmed by BOTH an async webhook (`/payment/webhook`) and a manual admin "입금 확인" (`POST /admin/orders/:id/confirm-deposit`), which can fire concurrently. A status check outside the transaction let two callers both pass the gate and double-deduct stock/points/coupons. The in-transaction lock makes confirmation exactly-once.

**How to apply:** any new trigger that finalizes a paid order must call `finalizePaidOrder` (don't reimplement the mutation). Keep the gate/lock inside the transaction.

# Webhook order binding

vbank approval (resultCode 0000) is account ISSUANCE, not payment — never finalize there; set `order.status='payment_pending'`. Real confirmation is the deposit webhook or admin confirm.

`handleDepositWebhook` must verify the tid actually belongs to the order: `verifyPaymentWithNicePay` returns NicePay's `orderId`, and the webhook rejects if it ≠ the requested orderId, and rejects if `payment.method !== 'virtual_account'`. Without this a reused valid tid with a matching amount could finalize the wrong order.
