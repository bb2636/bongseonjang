---
name: OAuth Custom Tab 닫기 (Android)
description: 앱 OAuth(특히 구글) 시스템 브라우저 탭이 로그인 후 안 닫히는 문제의 원인과 표준 해법
---

# 앱 OAuth 시스템 브라우저 탭 닫기

구글 로그인은 인앱 WebView를 정책상 차단하므로 앱에서 `@capacitor/browser`의 `Browser.open()`(Chrome Custom Tab) + polling 방식을 쓴다. 카카오/네이버/애플은 `@capgo/inappbrowser`(WebView) 사용.

**Android에서 `Browser.close()`는 Chrome Custom Tab을 닫지 못한다 (iOS의 SFSafariViewController만 동작).**

**How to apply:** OAuth polling 완료 후 탭을 닫으려면 `Browser.close()`에 의존하지 말고, 완료 페이지(HTML)가 앱 스킴 딥링크(`bongseonjang://oauth/close`)로 자동 리다이렉트하여 앱을 포그라운드로 끌어올려 탭을 덮어야 한다. 자동 리다이렉트는 브라우저 정책으로 막힐 수 있으니 "앱으로 돌아가기" 버튼 fallback을 함께 둔다.

**Why:** 로그인 자체는 백그라운드 polling으로 성공하지만 탭만 남아 "자동으로 닫힙니다" 안내가 계속 떠 있던 버그가 있었다.

- 앱 딥링크 핸들러(App.tsx)는 `oauth/close` 경로를 받으면 **아무 처리 없이 무시**해야 한다. key 없는 딥링크로 `/social-callback`을 재진입하면 이미 소비된 세션 재처리로 "세션 만료" 에러가 난다.
- Android 인텐트 필터는 스킴(`bongseonjang`)만 등록되어 있어 `oauth/close` 같은 임의 경로도 자동 매칭된다(매니페스트 추가 불필요).
- 참고: Apple polling 완료 페이지는 아직 정적 안내(`sendPollingCompleteHtml`)를 써서 동일 패턴 미적용 — UX 통일 여지 있음.
