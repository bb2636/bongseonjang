const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;
const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
const SOCIAL_REDIRECT_BASE_URL = import.meta.env.VITE_SOCIAL_REDIRECT_BASE_URL;

let kakaoInitialized = false;
let naverSdkLoaded = false;
let naverSdkLoading = false;

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

  const redirectUri = `${SOCIAL_REDIRECT_BASE_URL}/oauth/kakao/callback`;

  window.Kakao.Auth.authorize({
    redirectUri,
    scope: 'profile_nickname,profile_image,account_email',
    throughTalk: false,
  });
}

function waitForNaverSdk(timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkSdk = () => {
      if (window.naver?.LoginWithNaverId) {
        naverSdkLoaded = true;
        naverSdkLoading = false;
        resolve();
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        naverSdkLoading = false;
        reject(new Error('네이버 SDK 초기화 시간이 초과되었습니다.'));
        return;
      }
      
      setTimeout(checkSdk, 50);
    };
    
    checkSdk();
  });
}

function loadNaverSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (naverSdkLoaded && window.naver?.LoginWithNaverId) {
      resolve();
      return;
    }

    if (naverSdkLoading) {
      waitForNaverSdk()
        .then(resolve)
        .catch(reject);
      return;
    }

    naverSdkLoading = true;

    const script = document.createElement('script');
    script.src = 'https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js';
    script.charset = 'utf-8';
    script.async = true;

    script.onload = () => {
      waitForNaverSdk()
        .then(resolve)
        .catch(reject);
    };

    script.onerror = () => {
      naverSdkLoading = false;
      reject(new Error('네이버 SDK 로드에 실패했습니다.'));
    };

    document.body.appendChild(script);
  });
}

export async function naverAuthorize(): Promise<void> {
  if (!NAVER_CLIENT_ID) {
    throw new Error('VITE_NAVER_CLIENT_ID is not configured');
  }

  await loadNaverSdk();

  if (!window.naver) {
    throw new Error('네이버 SDK 초기화에 실패했습니다.');
  }

  const callbackUrl = `${SOCIAL_REDIRECT_BASE_URL}/oauth/naver/callback`;

  const naverLogin = new window.naver.LoginWithNaverId({
    clientId: NAVER_CLIENT_ID,
    callbackUrl,
    isPopup: false,
    callbackHandle: true,
  });

  naverLogin.init();

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
  return `${SOCIAL_REDIRECT_BASE_URL}/oauth/kakao/callback`;
}

export function getNaverRedirectUri(): string {
  return `${SOCIAL_REDIRECT_BASE_URL}/oauth/naver/callback`;
}
