---
name: Social signup profile completion
description: Why social signup must finish profile/address save + login synchronously at submit, not on the complete page
---

# Social signup completion must be synchronous at submit

For social (Kakao/Naver/Google/Apple) new-user signup, the new user is already
created in DB at `socialLogin` time and gets a valid JWT (returned with
`isNewUser: true`). The remaining step is `completeSocialProfile` (saves name/
phone/address) plus applying that token via `loginWithToken`.

**Rule:** run `completeSocialProfile` + `loginWithToken` synchronously in the
profile-step submit handler (a mutation), then navigate to `/signup/complete`.
Do NOT defer it to an auto-running `useEffect` on the complete page that reads a
token handed off through `sessionStorage`.

**Why:** the old design stashed the token in `sessionStorage` and let the
complete page's effect call the API + login on mount. That handoff was flaky —
production data showed social users with inconsistent shipping addresses (0/1/5)
and the reported symptom of having to log in a second time. If the deferred API
call failed, login was skipped entirely and the address was silently lost.

**How to apply:** keep the address requirement (zonecode+address+addressDetail)
validated in the profile step for all signups. On submit failure, show an error
and stay on the page so the user can retry — never navigate to the success page
or partially log in. The `/signup/complete` page should be presentational only;
do not log anyone in there (avoids logging in users with incomplete profiles).
Normal email signup already does this correctly (register API in submit, login
in onSuccess).
