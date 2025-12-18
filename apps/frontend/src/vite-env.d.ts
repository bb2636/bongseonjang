/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KAKAO_JS_KEY: string
  readonly VITE_NAVER_CLIENT_ID: string
  readonly VITE_SOCIAL_REDIRECT_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
