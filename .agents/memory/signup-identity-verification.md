---
name: Signup identity verification
description: How signup verifies users — email is only a uniqueness check, identity assurance is SMS at the profile step
---

# Signup identity verification

The email step of signup does NOT send a mailbox verification code. The external
Bubble (bubbleapps.io) email-send API is dead (401 "does not expose an API /
upgrade subscription"). The email step only calls `check-email` for uniqueness,
then advances by setting `isEmailVerified: true` locally.

Real identity assurance happens at the profile (step 3) via SOLAPI SMS:
`/auth/phone/send-code` + `/auth/phone/verify-code`. Signup completion is gated on
`formData.isPhoneVerified` (in `useSignupProfileStep` `isValid`).

Backend `UserApplicationService.register` does NOT check any email-verification
flag — it only rejects duplicate emails. So removing the email-code flow does not
weaken backend gating.

**Why:** Bubble email API was permanently broken and blocking all signups; SMS
verification was already working, so it became the sole identity gate.

**How to apply:** Don't reintroduce an email-code requirement expecting backend
enforcement — there is none. Dead leftovers remain but are unused:
`verificationCode`/`isCodeSent` in `SignupFormData`, and the send/verify email
service methods. Password reset still relies on the same broken Bubble email and
is likely also broken (handle separately if asked).
