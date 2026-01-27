import { InAppBrowser } from '@capgo/inappbrowser';
import { App } from '@capacitor/app';
import { checkIsCapacitor, CAPACITOR_APP_SCHEME, getApiBaseUrlDynamic, getCapacitorPlatform } from '@/shared/config/apiConfig';

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
    localStorage.setItem(`oauth_state_${provider}`, state);
    localStorage.setItem(`oauth_pending_provider`, provider);
  } catch (e) {
    console.warn('Failed to store OAuth state:', e);
  }
}

function validateAndClearOAuthState(provider: string, returnedState: string | null): boolean {
  try {
    const storedState = localStorage.getItem(`oauth_state_${provider}`);
    localStorage.removeItem(`oauth_state_${provider}`);
    localStorage.removeItem(`oauth_pending_provider`);
    
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

function clearOAuthState(provider: string): void {
  try {
    localStorage.removeItem(`oauth_state_${provider}`);
    localStorage.removeItem(`oauth_pending_provider`);
  } catch (e) {
    console.warn('Failed to clear OAuth state:', e);
  }
}

function parseOAuthCallbackUrl(url: string): OAuthResult | null {
  try {
    const urlObj = new URL(url.replace(`${CAPACITOR_APP_SCHEME}://`, 'https://app/'));
    const pathname = urlObj.pathname;
    const params = new URLSearchParams(urlObj.search);

    const providerMatch = pathname.match(/\/oauth\/(\w+)\/callback/);
    if (!providerMatch) {
      console.warn('[OAuth] Unknown callback path:', pathname);
      return null;
    }

    const callbackProvider = providerMatch[1];
    console.log('[OAuth] Processing callback for provider:', callbackProvider);

    const error = params.get('error');
    if (error) {
      clearOAuthState(callbackProvider);
      return { error };
    }

    const returnedState = params.get('state');
    if (!validateAndClearOAuthState(callbackProvider, returnedState)) {
      return { error: 'state_mismatch' };
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

    console.log('[OAuth] OAuth result:', result);
    return result;
  } catch (e) {
    console.error('[OAuth] Failed to parse callback URL:', e);
    return { error: 'parse_failed' };
  }
}

function isBackendOAuthCallbackUrl(url: string): { isCallback: boolean; provider: string | null; hasCode: boolean; hasError: boolean } {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const params = new URLSearchParams(urlObj.search);
    
    const callbackMatch = pathname.match(/\/api\/auth\/oauth\/(\w+)\/callback/) || 
                          pathname.match(/\/api\/auth\/(\w+)\/callback/);
    
    if (callbackMatch) {
      const provider = callbackMatch[1];
      const hasCode = params.has('code');
      const hasError = params.has('error');
      
      console.log('[OAuth] Backend callback detected:', { provider, hasCode, hasError, url });
      return { isCallback: true, provider, hasCode, hasError };
    }
  } catch (e) {
    console.log('[OAuth] Error parsing URL for backend callback check:', e);
  }
  
  return { isCallback: false, provider: null, hasCode: false, hasError: false };
}

async function openBrowserForOAuth(
  authUrl: string,
  provider: string,
  expectedState: string
): Promise<OAuthResult> {
  const platform = getCapacitorPlatform();
  console.log('[OAuth] === Starting OAuth with InAppBrowser ===');
  console.log('[OAuth] provider:', provider);
  console.log('[OAuth] platform:', platform);
  console.log('[OAuth] authUrl:', authUrl);

  storeOAuthState(provider, expectedState);

  return new Promise(async (resolve) => {
    let resolved = false;
    let urlChangeListener: { remove: () => Promise<void> } | null = null;
    let closeListener: { remove: () => Promise<void> } | null = null;
    let appUrlOpenListener: { remove: () => Promise<void> } | null = null;
    let backendCallbackDetected = false;

    const cleanup = async () => {
      if (urlChangeListener) {
        try {
          await urlChangeListener.remove();
        } catch (e) {
          console.log('[OAuth] Error removing urlChangeListener:', e);
        }
        urlChangeListener = null;
      }
      if (closeListener) {
        try {
          await closeListener.remove();
        } catch (e) {
          console.log('[OAuth] Error removing closeListener:', e);
        }
        closeListener = null;
      }
      if (appUrlOpenListener) {
        try {
          await appUrlOpenListener.remove();
        } catch (e) {
          console.log('[OAuth] Error removing appUrlOpenListener:', e);
        }
        appUrlOpenListener = null;
      }
    };

    const resolveOnce = async (result: OAuthResult) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeoutId);
      await cleanup();
      resolve(result);
    };

    const timeoutId = setTimeout(async () => {
      if (!resolved) {
        console.log('[OAuth] Timeout reached, assuming user cancelled');
        clearOAuthState(provider);
        try {
          await InAppBrowser.close();
        } catch (e) {
          console.log('[OAuth] Error closing browser on timeout:', e);
        }
        await resolveOnce({ error: 'timeout' });
      }
    }, 5 * 60 * 1000);

    try {
      appUrlOpenListener = await App.addListener('appUrlOpen', async (event) => {
        console.log('[OAuth] App deep-link received:', event.url);
        
        const url = event.url;
        
        if (url.startsWith(`${CAPACITOR_APP_SCHEME}://`)) {
          console.log('[OAuth] Deep-link detected custom scheme redirect');
          
          try {
            await InAppBrowser.close();
          } catch (e) {
            console.log('[OAuth] Browser already closed or error:', e);
          }

          const result = parseOAuthCallbackUrl(url);
          if (result) {
            await resolveOnce(result);
          } else {
            await resolveOnce({ error: 'unknown_callback_path' });
          }
        }
      });
      console.log('[OAuth] App deep-link listener registered');

      urlChangeListener = await InAppBrowser.addListener('urlChangeEvent', async (event) => {
        console.log('[OAuth] URL changed:', event.url);
        
        const url = event.url;
        
        if (url.startsWith(`${CAPACITOR_APP_SCHEME}://`)) {
          console.log('[OAuth] Detected custom scheme redirect in urlChangeEvent');
          
          try {
            await InAppBrowser.close();
          } catch (e) {
            console.log('[OAuth] Browser already closed or error:', e);
          }

          const result = parseOAuthCallbackUrl(url);
          if (result) {
            await resolveOnce(result);
          } else {
            await resolveOnce({ error: 'unknown_callback_path' });
          }
          return;
        }
        
        const backendCallback = isBackendOAuthCallbackUrl(url);
        if (backendCallback.isCallback && backendCallback.hasCode && !backendCallbackDetected) {
          backendCallbackDetected = true;
          console.log('[OAuth] Backend callback with code detected, waiting for custom scheme redirect...');
          console.log('[OAuth] Backend will process code and redirect to custom scheme');
          
          setTimeout(async () => {
            if (!resolved) {
              console.log('[OAuth] Closing browser to allow deep-link to be handled by App');
              try {
                await InAppBrowser.close();
              } catch (e) {
                console.log('[OAuth] Error closing browser after backend callback:', e);
              }
            }
          }, 2000);
        }
        
        if (backendCallback.isCallback && backendCallback.hasError) {
          console.log('[OAuth] Backend callback with error detected');
          try {
            await InAppBrowser.close();
          } catch (e) {
            console.log('[OAuth] Error closing browser:', e);
          }
          clearOAuthState(provider);
          await resolveOnce({ error: 'oauth_error' });
        }
      });

      closeListener = await InAppBrowser.addListener('closeEvent', async () => {
        console.log('[OAuth] Browser closed');
        if (!resolved) {
          if (backendCallbackDetected) {
            console.log('[OAuth] Browser closed after backend callback, waiting for deep-link...');
            setTimeout(async () => {
              if (!resolved) {
                console.log('[OAuth] No deep-link received after browser close, treating as cancelled');
                clearOAuthState(provider);
                await resolveOnce({ error: 'user_cancelled' });
              }
            }, 3000);
          } else {
            console.log('[OAuth] Browser closed by user without backend callback');
            clearOAuthState(provider);
            await resolveOnce({ error: 'user_cancelled' });
          }
        }
      });

      await InAppBrowser.openWebView({
        url: authUrl,
        title: 'Login',
      });
      console.log('[OAuth] InAppBrowser opened successfully');
    } catch (err) {
      console.error('[OAuth] Failed to open InAppBrowser:', err);
      clearTimeout(timeoutId);
      clearOAuthState(provider);
      await cleanup();
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

export async function kakaoAuthorize(): Promise<OAuthResult | void> {
  const isCapacitor = checkIsCapacitor();
  console.log('[KakaoOAuth] kakaoAuthorize called, isCapacitor:', isCapacitor);
  
  if (isCapacitor) {
    const backendUrl = getBackendBaseUrl();
    const redirectUri = `${backendUrl}/api/auth/oauth/kakao/callback`;
    console.log('[KakaoOAuth] Capacitor mode, redirectUri:', redirectUri);
    const state = generateStateWithAppScheme(CAPACITOR_APP_SCHEME);
    const stateForValidation = state.split('__scheme__')[0];
    
    const params = new URLSearchParams({
      client_id: KAKAO_REST_API_KEY || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'profile_nickname,profile_image,account_email',
      state,
    });

    const authUrl = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
    console.log('[KakaoOAuth] authUrl:', authUrl);
    
    const result = await openBrowserForOAuth(authUrl, 'kakao', stateForValidation);
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

  const state = generateRandomState();

  if (isCapacitor) {
    console.log('[NaverOAuth] Capacitor mode - using InAppBrowser');
    const backendUrl = getBackendBaseUrl();
    const redirectUri = `${backendUrl}/api/auth/oauth/naver/callback`;
    const fullState = generateStateWithAppScheme(CAPACITOR_APP_SCHEME);
    const stateForValidation = fullState.split('__scheme__')[0];
    
    const params = new URLSearchParams({
      client_id: NAVER_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      state: fullState,
    });

    const authUrl = `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
    console.log('[NaverOAuth] authUrl:', authUrl);
    
    const result = await openBrowserForOAuth(authUrl, 'naver', stateForValidation);
    console.log('[NaverOAuth] Browser result:', result);
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
    throw new Error('구글 로그인 설정이 올바르지 않습니다.');
  }

  const state = generateRandomState();

  if (isCapacitor) {
    console.log('[GoogleOAuth] Capacitor mode - using InAppBrowser');
    const backendUrl = getBackendBaseUrl();
    const redirectUri = `${backendUrl}/api/auth/oauth/google/callback`;
    const fullState = generateStateWithAppScheme(CAPACITOR_APP_SCHEME);
    const stateForValidation = fullState.split('__scheme__')[0];
    
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state: fullState,
      access_type: 'offline',
      prompt: 'consent',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    console.log('[GoogleOAuth] authUrl:', authUrl);
    
    const result = await openBrowserForOAuth(authUrl, 'google', stateForValidation);
    console.log('[GoogleOAuth] Browser result:', result);
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
    const fullState = generateStateWithAppScheme(CAPACITOR_APP_SCHEME);
    const stateForValidation = fullState.split('__scheme__')[0];
    const params = new URLSearchParams({
      client_id: APPLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code id_token',
      scope: 'name email',
      state: fullState,
      response_mode: 'form_post',
    });
    const authUrl = `https://appleid.apple.com/auth/authorize?${params.toString()}`;
    const result = await openBrowserForOAuth(authUrl, 'apple', stateForValidation);
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

function generateStateWithAppScheme(appScheme?: string): string {
  const randomPart = generateRandomState();
  if (appScheme) {
    return `${randomPart}__scheme__${appScheme}`;
  }
  return randomPart;
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
