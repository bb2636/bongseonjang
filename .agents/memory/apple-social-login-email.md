---
name: Apple Sign In missing-email handling
description: Why Apple social login must NOT be gated on email presence in the auth controller
---

Apple omits the email field on **repeat** sign-ins (it only returns email on the very first authorization). Naver/Kakao/Google generally always return email.

**Rule:** In the auth controller, do NOT short-circuit Apple sign-in with a `requiresEmail` response when email is missing. Always call `UserApplicationService.socialLogin` and let it decide.

**Why:** The service already resolves all cases correctly — it looks up the existing account by `(provider, providerUserId)` first and logs the user in immediately regardless of email; only brand-new users without email get a fallback `apple.<providerUserId>@apple-signin.invalid`. The old controller checked `if (!socialUserInfo.email)` *before* calling the service, so existing Apple users were wrongly pushed into an email-collection flow that errored — this caused an App Store rejection.

**How to apply:** Keep the `requiresEmail` path for kakao/naver/google only (guard like `!email && provider !== 'apple'`). The Apple-specific `appleCallback` (form_post/polling path used by iOS) must have no email guard at all. If you ever see a new "collect email after Apple login" requirement, route it through the service's existing-account lookup, never a pre-service guard.
