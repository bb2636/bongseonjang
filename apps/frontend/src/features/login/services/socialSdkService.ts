import { InAppBrowser } from '@capgo/inappbrowser';
import { checkIsCapacitor, CAPACITOR_APP_SCHEME, getApiBaseUrlDynamic } from '@/shared/config/apiConfig';

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;
const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID;
const SOCIAL_REDIRECT_BASE_URL = import.meta.env.VITE_SOCIAL_REDIRECT_BASE_URL;

function getBackendBaseUrl(): string {
  const apiUrl = getApiBaseUrlDynamic();
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

function storeOAuthState(provider: string, state: string): void {
  try {
    localStorage.setItem(`ios_oauth_state_${provider}`, state);
  } catch (e) {
    console.warn('Failed to store OAuth state:', e);
  }
}

function validateAndClearOAuthState(provider: string, returnedState: string | null): boolean {
  try {
    const storedState = localStorage.getItem(`ios_oauth_state_${provider}`);
    localStorage.removeItem(`ios_oauth_state_${provider}`);
    
    if (!storedState || !returnedState) {
      console.warn('OAuth state validation: missing state');
      return false;
    }
    
    return storedState === returnedState;
  } catch (e) {
    console.warn('Failed to validate OAuth state:', e);
    return false;
  }
}

function isValidCallbackUrl(url: string, callbackPathPattern: string): boolean {
  try {
    const backendUrl = getBackendBaseUrl();
    const allowedOrigins = [
      new URL(backendUrl).origin,
      SOCIAL_REDIRECT_BASE_URL ? new URL(SOCIAL_REDIRECT_BASE_URL).origin : null,
    ].filter(Boolean);
    
    if (url.startsWith(`${CAPACITOR_APP_SCHEME}://`)) {
      return true;
    }
    
    const urlObj = new URL(url);
    const isAllowedOrigin = allowedOrigins.some(origin => urlObj.origin === origin);
    const hasCallbackPath = urlObj.pathname.includes(callbackPathPattern);
    
    return isAllowedOrigin && hasCallbackPath;
  } catch {
    return false;
  }
}

async function openInAppBrowserForOAuth(
  authUrl: string,
  callbackPathPattern: string,
  provider: string,
  expectedState: string
): Promise<OAuthResult> {
  console.log('[InAppBrowser] === Starting OAuth ===');
  console.log('[InAppBrowser] provider:', provider);
  console.log('[InAppBrowser] authUrl:', authUrl);
  console.log('[InAppBrowser] callbackPathPattern:', callbackPathPattern);
  
  storeOAuthState(provider, expectedState);
  
  return new Promise((resolve, reject) => {
    let resolved = false;

    const handleUrlChange = (event: { url: string }) => {
      const url = event.url;
      console.log('[InAppBrowser] URL changed:', url);
      
      if (isValidCallbackUrl(url, callbackPathPattern)) {
        console.log('[InAppBrowser] Valid callback URL detected');
        if (resolved) return;
        resolved = true;
        
        InAppBrowser.removeAllListeners();
        InAppBrowser.close();
        
        try {
          const urlObj = new URL(url.replace(`${CAPACITOR_APP_SCHEME}://`, 'https://app/'));
          const params = new URLSearchParams(urlObj.search);
          
          const error = params.get('error');
          if (error) {
            localStorage.removeItem(`ios_oauth_state_${provider}`);
            resolve({ error });
            return;
          }
          
          const returnedState = params.get('state');
          if (!validateAndClearOAuthState(provider, returnedState)) {
            resolve({ error: 'state_mismatch' });
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
          localStorage.removeItem(`ios_oauth_state_${provider}`);
          reject(new Error('OAuth 응답 파싱 실패'));
        }
      }
    };

    const handleClose = () => {
      console.log('[InAppBrowser] Browser closed');
      if (!resolved) {
        resolved = true;
        InAppBrowser.removeAllListeners();
        localStorage.removeItem(`ios_oauth_state_${provider}`);
        resolve({ error: 'cancelled' });
      }
    };

    console.log('[InAppBrowser] Adding listeners...');
    InAppBrowser.addListener('urlChangeEvent', handleUrlChange);
    InAppBrowser.addListener('closeEvent', handleClose);

    console.log('[InAppBrowser] Opening WebView...');
    InAppBrowser.openWebView({
      url: authUrl,
      headers: {},
      isPresentAfterPageLoad: true,
    }).then(() => {
      console.log('[InAppBrowser] WebView opened successfully');
    }).catch((err) => {
      console.error('[InAppBrowser] Failed to open WebView:', err);
      InAppBrowser.removeAllListeners();
      localStorage.removeItem(`ios_oauth_state_${provider}`);
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
  const isCapacitor = checkIsCapacitor();
  console.log('[KakaoOAuth] kakaoAuthorize called, isCapacitor:', isCapacitor);
  
  if (isCapacitor) {
    const backendUrl = getBackendBaseUrl();
    const redirectUri = `${backendUrl}/api/auth/oauth/kakao/callback`;
    console.log('[KakaoOAuth] Capacitor mode, redirectUri:', redirectUri);
    const state = generateRandomState();
    
    const params = new URLSearchParams({
      client_id: KAKAO_REST_API_KEY || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'profile_nickname,profile_image,account_email',
      state,
    });

    const authUrl = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
    console.log('[KakaoOAuth] authUrl:', authUrl);
    
    const result = await openInAppBrowserForOAuth(authUrl, '/oauth/kakao/callback', 'kakao', state);
    return result;
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
  const isCapacitor = checkIsCapacitor();
  console.log('[NaverOAuth] naverAuthorize called');
  console.log('[NaverOAuth] NAVER_CLIENT_ID:', NAVER_CLIENT_ID ? 'SET' : 'NOT SET');
  console.log('[NaverOAuth] isCapacitor:', isCapacitor);
  
  if (!NAVER_CLIENT_ID) {
    console.error('[NaverOAuth] VITE_NAVER_CLIENT_ID is not configured');
    throw new Error('VITE_NAVER_CLIENT_ID is not configured');
  }

  const state = generateRandomState();

  if (isCapacitor) {
    console.log('[NaverOAuth] Capacitor mode - using InAppBrowser');
    const backendUrl = getBackendBaseUrl();
    const redirectUri = `${backendUrl}/api/auth/oauth/naver/callback`;
    
    const params = new URLSearchParams({
      client_id: NAVER_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
    });

    const authUrl = `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
    console.log('[NaverOAuth] authUrl:', authUrl);
    
    const result = await openInAppBrowserForOAuth(authUrl, '/oauth/naver/callback', 'naver', state);
    console.log('[NaverOAuth] InAppBrowser result:', result);
    return result;
  }

  const redirectUri = `${SOCIAL_REDIRECT_BASE_URL}/oauth/naver/callback`;

  console.log('[Naver OAuth] === Authorize Request (Direct URL) ===');
  console.log('[Naver OAuth] client_id:', NAVER_CLIENT_ID);
  console.log('[Naver OAuth] redirect_uri:', redirectUri);
  console.log('[Naver OAuth] state:', state);

  const params = new URLSearchParams({
    client_id: NAVER_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
  });

  const authUrl = `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
  
  console.log('[Naver OAuth] Final authUrl:', authUrl);

  sessionStorage.setItem('naver_oauth_state', state);
  
  window.location.href = authUrl;
}

export async function googleAuthorize(): Promise<OAuthResult | void> {
  const isCapacitor = checkIsCapacitor();
  console.log('[GoogleOAuth] googleAuthorize called');
  console.log('[GoogleOAuth] GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
  console.log('[GoogleOAuth] isCapacitor:', isCapacitor);
  
  if (!GOOGLE_CLIENT_ID) {
    console.error('[GoogleOAuth] VITE_GOOGLE_CLIENT_ID is not configured');
    throw new Error('VITE_GOOGLE_CLIENT_ID is not configured');
  }

  const state = generateRandomState();

  if (isCapacitor) {
    console.log('[GoogleOAuth] Capacitor mode - using InAppBrowser');
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
    console.log('[GoogleOAuth] authUrl:', authUrl);
    
    const result = await openInAppBrowserForOAuth(authUrl, '/oauth/google/callback', 'google', state);
    console.log('[GoogleOAuth] InAppBrowser result:', result);
    return result;
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
  const isCapacitor = checkIsCapacitor();
  
  if (!APPLE_CLIENT_ID) {
    throw new Error('VITE_APPLE_CLIENT_ID is not configured');
  }

  const state = generateRandomState();

  if (isCapacitor) {
    const backendUrl = getBackendBaseUrl();
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
    const result = await openInAppBrowserForOAuth(authUrl, '/oauth/apple', 'apple', state);
    return result;
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
