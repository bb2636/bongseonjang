import { InAppBrowser, UrlEvent } from '@capgo/inappbrowser';
import { checkIsCapacitor, getApiBaseUrlDynamic } from '@/shared/config/apiConfig';

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
  name?: string;
  profileImage?: string;
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

async function fetchSessionData(key: string): Promise<OAuthResult> {
  try {
    const response = await fetch(`${getApiBaseUrlDynamic()}/auth/session/${key}`);
    if (!response.ok) {
      return { error: 'session_expired' };
    }
    return response.json();
  } catch (e) {
    console.error('[OAuth] Failed to fetch session data:', e);
    return { error: 'session_fetch_failed' };
  }
}

async function openInAppBrowserForOAuth(authUrl: string, provider: string): Promise<OAuthResult> {
  console.log('[OAuth] === Starting OAuth with InAppBrowser ===');
  console.log('[OAuth] provider:', provider);
  console.log('[OAuth] authUrl:', authUrl);

  return new Promise(async (resolve) => {
    let resolved = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleUrlChange = async (event: UrlEvent) => {
      const url = event.url;
      console.log('[OAuth] URL changed:', url);

      if (url.includes('/social-callback')) {
        try {
          const urlObj = new URL(url);
          const key = urlObj.searchParams.get('key');

          if (key && !resolved) {
            resolved = true;
            console.log('[OAuth] Detected callback with key:', key);

            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }

            await InAppBrowser.removeAllListeners();
            await InAppBrowser.close();

            const result = await fetchSessionData(key);
            console.log('[OAuth] Session data:', result);
            resolve(result);
          }
        } catch (e) {
          console.error('[OAuth] Error parsing callback URL:', e);
        }
      }
    };

    const handleClose = () => {
      console.log('[OAuth] InAppBrowser closed');
      
      if (!resolved) {
        resolved = true;
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        InAppBrowser.removeAllListeners();
        resolve({ error: 'cancelled' });
      }
    };

    await InAppBrowser.addListener('urlChangeEvent', handleUrlChange);
    await InAppBrowser.addListener('closeEvent', handleClose);

    timeoutId = setTimeout(async () => {
      if (!resolved) {
        console.log('[OAuth] Timeout reached');
        resolved = true;
        await InAppBrowser.removeAllListeners();
        await InAppBrowser.close().catch(() => {});
        resolve({ error: 'timeout' });
      }
    }, 5 * 60 * 1000);

    try {
      await InAppBrowser.openWebView({ url: authUrl });
      console.log('[OAuth] InAppBrowser opened');
    } catch (err) {
      console.error('[OAuth] Failed to open InAppBrowser:', err);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      await InAppBrowser.removeAllListeners();
      resolved = true;
      resolve({ error: 'browser_open_failed' });
    }
  });
}

let kakaoInitialized = false;

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

function generateRandomState(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
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
      state: state,
    });

    const authUrl = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
    console.log('[KakaoOAuth] authUrl:', authUrl);
    
    const result = await openInAppBrowserForOAuth(authUrl, 'kakao');
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

export async function naverAuthorize(): Promise<OAuthResult | void> {
  const isCapacitor = checkIsCapacitor();
  console.log('[NaverOAuth] naverAuthorize called');
  console.log('[NaverOAuth] NAVER_CLIENT_ID:', NAVER_CLIENT_ID ? 'SET' : 'NOT SET');
  console.log('[NaverOAuth] isCapacitor:', isCapacitor);
  
  if (!NAVER_CLIENT_ID) {
    console.error('[NaverOAuth] VITE_NAVER_CLIENT_ID is not configured');
    throw new Error('네이버 로그인 설정이 올바르지 않습니다.');
  }

  if (isCapacitor) {
    console.log('[NaverOAuth] Capacitor mode - using InAppBrowser');
    const backendUrl = getBackendBaseUrl();
    const redirectUri = `${backendUrl}/api/auth/oauth/naver/callback`;
    
    const state = generateRandomState();
    
    const params = new URLSearchParams({
      client_id: NAVER_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      state: state,
    });

    const authUrl = `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
    console.log('[NaverOAuth] authUrl:', authUrl);
    
    const result = await openInAppBrowserForOAuth(authUrl, 'naver');
    console.log('[NaverOAuth] InAppBrowser result:', result);
    return result;
  }

  const state = generateRandomState();
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
    throw new Error('구글 로그인 설정이 올바르지 않습니다.');
  }

  if (isCapacitor) {
    console.log('[GoogleOAuth] Capacitor mode - using InAppBrowser');
    const backendUrl = getBackendBaseUrl();
    const redirectUri = `${backendUrl}/api/auth/oauth/google/callback`;
    
    const state = generateRandomState();
    
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state: state,
      access_type: 'offline',
      prompt: 'consent',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    console.log('[GoogleOAuth] authUrl:', authUrl);
    
    const result = await openInAppBrowserForOAuth(authUrl, 'google');
    console.log('[GoogleOAuth] InAppBrowser result:', result);
    return result;
  }

  const state = generateRandomState();
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
  console.log('[AppleOAuth] appleAuthorize called, isCapacitor:', isCapacitor);
  
  if (!APPLE_CLIENT_ID) {
    throw new Error('VITE_APPLE_CLIENT_ID is not configured');
  }

  if (isCapacitor) {
    console.log('[AppleOAuth] Capacitor mode - using InAppBrowser');
    const backendUrl = getBackendBaseUrl();
    const redirectUri = `${backendUrl}/api/auth/apple/callback`;
    
    const state = generateRandomState();
    
    const params = new URLSearchParams({
      client_id: APPLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code id_token',
      scope: 'name email',
      state: state,
      response_mode: 'form_post',
    });
    
    const authUrl = `https://appleid.apple.com/auth/authorize?${params.toString()}`;
    console.log('[AppleOAuth] authUrl:', authUrl);
    
    const result = await openInAppBrowserForOAuth(authUrl, 'apple');
    console.log('[AppleOAuth] InAppBrowser result:', result);
    return result;
  }

  const state = generateRandomState();
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
