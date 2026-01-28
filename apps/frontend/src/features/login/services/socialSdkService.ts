import { InAppBrowser, UrlEvent } from '@capgo/inappbrowser';
import { checkIsCapacitor, getApiBaseUrlDynamic, getAbsoluteApiUrl } from '@/shared/config/apiConfig';

function getBackendBaseUrl(): string {
  const apiUrl = getAbsoluteApiUrl();
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
    return await openInAppBrowserForOAuth('google');
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
