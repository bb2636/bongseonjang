import { Browser } from '@capacitor/browser';
import { InAppBrowser } from '@capgo/inappbrowser';
import { IS_CAPACITOR, CAPACITOR_APP_SCHEME, API_BASE_URL, IS_IOS } from '@/shared/config/apiConfig';

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;
const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID;
const SOCIAL_REDIRECT_BASE_URL = import.meta.env.VITE_SOCIAL_REDIRECT_BASE_URL;

function getBackendBaseUrl(): string {
  const apiUrl = API_BASE_URL;
  return apiUrl.replace(/\/api$/, '');
}

export interface OAuthResult {
  token?: string;
  refreshToken?: string;
  error?: string;
  isNewUser?: boolean;
  requiresEmail?: boolean;
  tempToken?: string;
  provider?: string;
  providerId?: string;
}

async function openInAppBrowserForOAuth(
  authUrl: string,
  callbackPathPattern: string
): Promise<OAuthResult> {
  return new Promise((resolve, reject) => {
    let resolved = false;

    const handleUrlChange = (event: { url: string }) => {
      const url = event.url;
      
      if (url.includes(callbackPathPattern) || url.startsWith(`${CAPACITOR_APP_SCHEME}://`)) {
        if (resolved) return;
        resolved = true;
        
        InAppBrowser.removeAllListeners();
        InAppBrowser.close();
        
        try {
          const urlObj = new URL(url.replace(`${CAPACITOR_APP_SCHEME}://`, 'https://app/'));
          const params = new URLSearchParams(urlObj.search);
          
          const error = params.get('error');
          if (error) {
            resolve({ error });
            return;
          }
          
          const result: OAuthResult = {
            token: params.get('token') || undefined,
            refreshToken: params.get('refreshToken') || undefined,
            isNewUser: params.get('isNewUser') === 'true',
            requiresEmail: params.get('requiresEmail') === 'true',
            tempToken: params.get('tempToken') || undefined,
            provider: params.get('provider') || undefined,
            providerId: params.get('providerId') || undefined,
          };
          
          resolve(result);
        } catch (e) {
          reject(new Error('OAuth 응답 파싱 실패'));
        }
      }
    };

    const handleClose = () => {
      if (!resolved) {
        resolved = true;
        InAppBrowser.removeAllListeners();
        resolve({ error: 'cancelled' });
      }
    };

    InAppBrowser.addListener('urlChangeEvent', handleUrlChange);
    InAppBrowser.addListener('closeEvent', handleClose);

    InAppBrowser.openWebView({
      url: authUrl,
      headers: {},
      isPresentAfterPageLoad: true,
    }).catch((err) => {
      InAppBrowser.removeAllListeners();
      reject(err);
    });
  });
}

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

export async function kakaoAuthorize(): Promise<OAuthResult | void> {
  if (IS_CAPACITOR) {
    const backendUrl = getBackendBaseUrl();
    const redirectUri = `${backendUrl}/api/auth/oauth/kakao/callback`;
    const state = generateRandomState();
    
    const params = new URLSearchParams({
      client_id: KAKAO_REST_API_KEY || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'profile_nickname,profile_image,account_email',
      state,
    });

    const authUrl = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
    
    if (IS_IOS) {
      const result = await openInAppBrowserForOAuth(authUrl, '/oauth/kakao/callback');
      return result;
    } else {
      const androidRedirectUri = `${backendUrl}/api/auth/oauth/kakao/callback?appScheme=${CAPACITOR_APP_SCHEME}`;
      const androidParams = new URLSearchParams({
        client_id: KAKAO_REST_API_KEY || '',
        redirect_uri: androidRedirectUri,
        response_type: 'code',
        scope: 'profile_nickname,profile_image,account_email',
        state,
      });
      const androidAuthUrl = `https://kauth.kakao.com/oauth/authorize?${androidParams.toString()}`;
      await Browser.open({ url: androidAuthUrl });
      return;
    }
  }

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

export async function naverAuthorize(): Promise<OAuthResult | void> {
  if (!NAVER_CLIENT_ID) {
    throw new Error('VITE_NAVER_CLIENT_ID is not configured');
  }

  const state = generateRandomState();

  if (IS_CAPACITOR) {
    const backendUrl = getBackendBaseUrl();
    const redirectUri = `${backendUrl}/api/auth/oauth/naver/callback`;
    
    const params = new URLSearchParams({
      client_id: NAVER_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
    });

    const authUrl = `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
    
    if (IS_IOS) {
      const result = await openInAppBrowserForOAuth(authUrl, '/oauth/naver/callback');
      return result;
    } else {
      const androidRedirectUri = `${backendUrl}/api/auth/oauth/naver/callback?appScheme=${CAPACITOR_APP_SCHEME}`;
      const androidParams = new URLSearchParams({
        client_id: NAVER_CLIENT_ID,
        redirect_uri: androidRedirectUri,
        response_type: 'code',
        state,
      });
      const androidAuthUrl = `https://nid.naver.com/oauth2.0/authorize?${androidParams.toString()}`;
      await Browser.open({ url: androidAuthUrl });
      return;
    }
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

  sessionStorage.setItem('naver_oauth_state', state);

  const authUrl = naverLogin.generateAuthorizeUrl();
  const urlWithState = authUrl.includes('?') 
    ? `${authUrl}&state=${state}` 
    : `${authUrl}?state=${state}`;
  
  window.location.href = urlWithState;
}

export async function googleAuthorize(): Promise<OAuthResult | void> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('VITE_GOOGLE_CLIENT_ID is not configured');
  }

  const state = generateRandomState();

  if (IS_CAPACITOR) {
    const backendUrl = getBackendBaseUrl();
    const redirectUri = `${backendUrl}/api/auth/oauth/google/callback`;
    
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'offline',
      prompt: 'consent',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    if (IS_IOS) {
      const result = await openInAppBrowserForOAuth(authUrl, '/oauth/google/callback');
      return result;
    } else {
      const androidRedirectUri = `${backendUrl}/api/auth/oauth/google/callback?appScheme=${CAPACITOR_APP_SCHEME}`;
      const androidParams = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: androidRedirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        state,
        access_type: 'offline',
        prompt: 'consent',
      });
      const androidAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${androidParams.toString()}`;
      await Browser.open({ url: androidAuthUrl });
      return;
    }
  }

  const redirectUri = `${SOCIAL_REDIRECT_BASE_URL}/oauth/google/callback`;
  sessionStorage.setItem('google_oauth_state', state);

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'consent',
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function appleAuthorize(): Promise<OAuthResult | void> {
  if (!APPLE_CLIENT_ID) {
    throw new Error('VITE_APPLE_CLIENT_ID is not configured');
  }

  const state = generateRandomState();

  if (IS_CAPACITOR) {
    const backendUrl = getBackendBaseUrl();
    
    if (IS_IOS) {
      const redirectUri = `${backendUrl}/api/auth/apple/callback`;
      const params = new URLSearchParams({
        client_id: APPLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'code id_token',
        scope: 'name email',
        state,
        response_mode: 'form_post',
      });
      const authUrl = `https://appleid.apple.com/auth/authorize?${params.toString()}`;
      const result = await openInAppBrowserForOAuth(authUrl, '/oauth/apple');
      return result;
    } else {
      const redirectUri = `${backendUrl}/api/auth/apple/callback?appScheme=${CAPACITOR_APP_SCHEME}`;
      const params = new URLSearchParams({
        client_id: APPLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'code id_token',
        scope: 'name email',
        state,
        response_mode: 'form_post',
      });
      const authUrl = `https://appleid.apple.com/auth/authorize?${params.toString()}`;
      await Browser.open({ url: authUrl });
      return;
    }
  }

  const redirectUri = `${SOCIAL_REDIRECT_BASE_URL}/api/auth/apple/callback`;
  sessionStorage.setItem('apple_oauth_state', state);

  const params = new URLSearchParams({
    client_id: APPLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code id_token',
    scope: 'name email',
    state,
    response_mode: 'form_post',
  });

  window.location.href = `https://appleid.apple.com/auth/authorize?${params.toString()}`;
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

export function getGoogleRedirectUri(): string {
  return `${SOCIAL_REDIRECT_BASE_URL}/oauth/google/callback`;
}

export function getAppleRedirectUri(): string {
  return `${SOCIAL_REDIRECT_BASE_URL}/oauth/apple/callback`;
}
