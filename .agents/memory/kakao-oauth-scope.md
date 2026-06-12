---
name: Kakao OAuth scope & email gate
description: Why Kakao login requests no email scope, and how the no-email gate must exempt Kakao
---

# Kakao OAuth: no account_email scope

Kakao login requests only `profile_nickname,profile_image` — NOT `account_email`.

**Why:** Kakao's email consent item (account_email) cannot be activated until the
Kakao app is converted to a 비즈앱 (business app, requires verification). Before
that, requesting account_email makes Kakao return **KOE205 (잘못된 요청 / 동의항목
설정 오류)** and login fails entirely. App name showing on the KOE205 screen means
the REST API key is valid — KOE205 is purely a 동의항목/scope config problem, not a
key or redirect problem (redirect mismatch is KOE006 instead).

**How to apply:**
- Keep Kakao scope limited to profile items until the business app is approved.
- Any OAuth callback "no email → requiresEmail" gate must EXEMPT kakao (like apple),
  otherwise every Kakao login is wrongly diverted to email-collection and existing
  Kakao users can't re-login seamlessly. The service layer already handles null
  email (existing users matched by providerId; new users get a placeholder email).
- New social users without email get a placeholder `{provider}.{providerUserId}@social-signin.invalid`.
- The Kakao console Redirect URI must exactly match the backend callback
  `{SOCIAL_REDIRECT_BASE_URL}/api/auth/oauth/kakao/callback`.
