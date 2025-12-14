const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;
const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
const SOCIAL_REDIRECT_BASE_URL = import.meta.env.VITE_SOCIAL_REDIRECT_BASE_URL;

let kakaoInitialized = false;
let naverLoginInstance: naver.LoginWithNaverId | null = null;

export function initKakaoSdk(): boolean {
  if (kakaoInitialized) {
    return true;
  }

  if (!KAKAO_JS_KEY) {
    console.error('VITE_KAKAO_JS_KEY is not configured');
    return false;
  }

  if (!window.Kakao) {
    console.error('Kakao SDK is not loaded');
    return false;
  }

  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(KAKAO_JS_KEY);
  }

  kakaoInitialized = window.Kakao.isInitialized();
  return kakaoInitialized;
}

export function kakaoAuthorize(): void {
  if (!initKakaoSdk()) {
    throw new Error('카카오 SDK 초기화에 실패했습니다.');
  }

  const redirectUri = `${SOCIAL_REDIRECT_BASE_URL}/auth/kakao/callback`;

  window.Kakao.Auth.authorize({
    redirectUri,
    scope: 'profile_nickname,profile_image,account_email',
  });
}

export function initNaverSdk(): naver.LoginWithNaverId | null {
  if (naverLoginInstance) {
    return naverLoginInstance;
  }

  if (!NAVER_CLIENT_ID) {
    console.error('VITE_NAVER_CLIENT_ID is not configured');
    return null;
  }

  if (!window.naver) {
    console.error('Naver SDK is not loaded');
    return null;
  }

  const callbackUrl = `${SOCIAL_REDIRECT_BASE_URL}/auth/naver/callback`;

  naverLoginInstance = new window.naver.LoginWithNaverId({
    clientId: NAVER_CLIENT_ID,
    callbackUrl,
    isPopup: false,
    callbackHandle: true,
  });

  naverLoginInstance.init();
  return naverLoginInstance;
}

export function naverAuthorize(): void {
  const naverLogin = initNaverSdk();
  
  if (!naverLogin) {
    throw new Error('네이버 SDK 초기화에 실패했습니다.');
  }

  const state = generateRandomState();
  sessionStorage.setItem('naver_oauth_state', state);

  const authUrl = naverLogin.generateAuthorizeUrl();
  const urlWithState = authUrl.includes('?') 
    ? `${authUrl}&state=${state}` 
    : `${authUrl}?state=${state}`;
  
  window.location.href = urlWithState;
}

function generateRandomState(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function getKakaoRedirectUri(): string {
  return `${SOCIAL_REDIRECT_BASE_URL}/auth/kakao/callback`;
}

export function getNaverRedirectUri(): string {
  return `${SOCIAL_REDIRECT_BASE_URL}/auth/naver/callback`;
}
