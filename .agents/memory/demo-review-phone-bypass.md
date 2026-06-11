---
name: Demo review phone bypass
description: A fixed-code SMS bypass exists for App Store review — what it is, why, and the limits to respect
---

# Demo review phone bypass

There is an intentional backdoor in the phone-verification controller endpoints
(`/auth/phone/send-code`, `/auth/phone/verify-code`): for one designated demo
number (`DEMO_REVIEW_PHONE`, default `01000000000`, env-overridable), `send-code`
returns success without sending real SMS, and `verify-code` passes only when the
code is exactly `000000`. Any other phone number is unaffected and goes through
the real (Solapi) service.

**Why:** Apple App Review (Guideline 2.1(a)) cannot receive SMS codes; Apple's
own recommendation is to set a fixed code for the demo account. The bypass lives
at the controller level (not in the service) so it works regardless of which
phone service is active in production.

**How to apply:**
- Don't remove this before App Store review passes. After review, it can be
  retired (change/clear `DEMO_REVIEW_PHONE` or delete the bypass).
- Keep it scoped to the single demo number + fixed `000000`. Never widen to "any
  number with 000000" — that would be a global auth bypass.
- Known separate gap (NOT introduced by this bypass): phone verification is only
  enforced client-side; `register`/`completeSocialProfile` don't require server
  proof of verification. Treat hardening that as its own task.
- Apple reviews the PUBLISHED app, so this must be deployed to take effect.
