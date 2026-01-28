import { InAppBrowser, UrlEvent } from '@capgo/inappbrowser';
import { Browser } from '@capacitor/browser';
import { App as CapacitorApp } from '@capacitor/app';
import { checkIsCapacitor, getApiBaseUrlDynamic, getAbsoluteApiUrl, CAPACITOR_APP_SCHEME } from '@/shared/config/apiConfig';

function getBackendBaseUrl(): string {
  const apiUrl = getAbsoluteApiUrl();
  return apiUrl.replace(/\/api$/, '');
}

let googleOAuthResolver: ((result: OAuthResult) => void) | null = null;

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
    const apiUrl = `${getApiBaseUrlDynamic()}/auth/session/${key}`;
    console.log('[OAuth] Fetching session data from:', apiUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('[OAuth] Session fetch failed with status:', response.status);
      return { error: 'session_expired' };
    }
    const data = await response.json();
    console.log('[OAuth] Session data received:', JSON.stringify(data));
    return data;
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      console.error('[OAuth] Session fetch timed out');
      return { error: 'session_fetch_timeout' };
    }
    console.error('[OAuth] Failed to fetch session data:', e);
    return { error: 'session_fetch_failed' };
  }
}

let googleOAuthTimeoutId: ReturnType<typeof setTimeout> | null = null;

async function openSystemBrowserForGoogleOAuth(): Promise<OAuthResult> {
  const backendUrl = getBackendBaseUrl();
  const authUrl = `${backendUrl}/api/auth/start/google?platform=app`;
  
  console.log('[GoogleOAuth] === Starting Google OAuth with System Browser ===');
  console.log('[GoogleOAuth] backendUrl:', backendUrl);
  console.log('[GoogleOAuth] authUrl:', authUrl);

  return new Promise(async (resolve) => {
    googleOAuthResolver = resolve;
    
    if (googleOAuthTimeoutId) {
      clearTimeout(googleOAuthTimeoutId);
    }
    
    googleOAuthTimeoutId = setTimeout(async () => {
      if (googleOAuthResolver) {
        console.log('[GoogleOAuth] Timeout reached (5 min)');
        googleOAuthResolver = null;
        googleOAuthTimeoutId = null;
        try {
          await Browser.close();
        } catch (e) {
          console.log('[GoogleOAuth] Browser close on timeout error:', e);
        }
        resolve({ error: 'timeout' });
      }
    }, 5 * 60 * 1000);

    try {
      await Browser.open({ url: authUrl, windowName: '_blank' });
      console.log('[GoogleOAuth] System browser opened successfully');
    } catch (err) {
      console.error('[GoogleOAuth] Failed to open system browser:', err);
      if (googleOAuthTimeoutId) {
        clearTimeout(googleOAuthTimeoutId);
        googleOAuthTimeoutId = null;
      }
      googleOAuthResolver = null;
      resolve({ error: 'browser_open_failed' });
    }
  });
}

export async function handleGoogleOAuthDeepLink(url: string): Promise<boolean> {
  console.log('[GoogleOAuth] handleGoogleOAuthDeepLink called:', url);
  console.log('[GoogleOAuth] googleOAuthResolver exists:', !!googleOAuthResolver);
  
  try {
    console.log('[GoogleOAuth] Closing system browser...');
    await Browser.close();
    console.log('[GoogleOAuth] Browser closed');
  } catch (e) {
    console.log('[GoogleOAuth] Browser close error (non-fatal):', e);
  }
  
  if (!googleOAuthResolver) {
    console.log('[GoogleOAuth] No resolver found, will navigate to social-callback');
    return false;
  }

  const schemePrefix = `${CAPACITOR_APP_SCHEME}://oauth/google/callback`;
  if (!url.startsWith(schemePrefix)) {
    console.log('[GoogleOAuth] URL does not match Google OAuth callback pattern');
    return false;
  }

  const resolver = googleOAuthResolver;
  googleOAuthResolver = null;
  
  if (googleOAuthTimeoutId) {
    clearTimeout(googleOAuthTimeoutId);
    googleOAuthTimeoutId = null;
    console.log('[GoogleOAuth] Timeout cleared');
  }

  try {
    const urlObj = new URL(url.replace(`${CAPACITOR_APP_SCHEME}://`, 'https://app/'));
    const key = urlObj.searchParams.get('key');
    const error = urlObj.searchParams.get('error');

    console.log('[GoogleOAuth] Parsed URL - key:', key, 'error:', error);

    if (error) {
      console.log('[GoogleOAuth] OAuth error:', error);
      resolver({ error });
      return true;
    }

    if (key) {
      console.log('[GoogleOAuth] Fetching session data for key:', key);
      const result = await fetchSessionData(key);
      console.log('[GoogleOAuth] Session data result:', JSON.stringify(result));
      resolver(result);
      return true;
    }

    console.log('[GoogleOAuth] No key in callback URL');
    resolver({ error: 'no_key' });
    return true;
  } catch (e) {
    console.error('[GoogleOAuth] Error handling callback:', e);
    resolver({ error: 'callback_parse_failed' });
    return true;
  }
}

async function openInAppBrowserForOAuth(provider: string): Promise<OAuthResult> {
  const backendUrl = getBackendBaseUrl();
  const authUrl = `${backendUrl}/api/auth/start/${provider}?platform=app`;
  
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

function redirectToWebOAuth(provider: string): void {
  const backendUrl = getBackendBaseUrl();
  const authUrl = `${backendUrl}/api/auth/start/${provider}`;
  console.log('[OAuth] Web redirect to:', authUrl);
  window.location.href = authUrl;
}

export async function kakaoAuthorize(): Promise<OAuthResult | void> {
  const isCapacitor = checkIsCapacitor();
  console.log('[KakaoOAuth] kakaoAuthorize called, isCapacitor:', isCapacitor);
  
  if (isCapacitor) {
    return await openInAppBrowserForOAuth('kakao');
  }
  
  redirectToWebOAuth('kakao');
}

export async function naverAuthorize(): Promise<OAuthResult | void> {
  const isCapacitor = checkIsCapacitor();
  console.log('[NaverOAuth] naverAuthorize called, isCapacitor:', isCapacitor);
  
  if (isCapacitor) {
    return await openInAppBrowserForOAuth('naver');
  }
  
  redirectToWebOAuth('naver');
}

export async function googleAuthorize(): Promise<OAuthResult | void> {
  const isCapacitor = checkIsCapacitor();
  console.log('[GoogleOAuth] googleAuthorize called, isCapacitor:', isCapacitor);
  
  if (isCapacitor) {
    return await openSystemBrowserForGoogleOAuth();
  }
  
  redirectToWebOAuth('google');
}

export async function appleAuthorize(): Promise<OAuthResult | void> {
  const isCapacitor = checkIsCapacitor();
  console.log('[AppleOAuth] appleAuthorize called, isCapacitor:', isCapacitor);
  
  if (isCapacitor) {
    return await openInAppBrowserForOAuth('apple');
  }
  
  redirectToWebOAuth('apple');
}

export function initKakaoSdk(): boolean {
  return true;
}

export function getKakaoRedirectUri(): string {
  return '';
}

export function getNaverRedirectUri(): string {
  return '';
}

export function getGoogleRedirectUri(): string {
  return '';
}

export function getAppleRedirectUri(): string {
  return '';
}
