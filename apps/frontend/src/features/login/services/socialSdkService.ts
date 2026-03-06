import { InAppBrowser, UrlEvent } from '@capgo/inappbrowser';
import { Browser } from '@capacitor/browser';
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

let googlePollingIntervalId: ReturnType<typeof setInterval> | null = null;
let googlePollingTimeoutId: ReturnType<typeof setTimeout> | null = null;

async function openSystemBrowserForGoogleOAuth(): Promise<OAuthResult> {
  const apiUrl = getApiBaseUrlDynamic();

  console.log('[GoogleOAuth] === Starting Google OAuth with System Browser (Chrome Custom Tabs) + Polling ===');

  let pollingSessionId: string;
  try {
    const createResponse = await fetch(`${apiUrl}/auth/polling-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!createResponse.ok) {
      console.error('[GoogleOAuth] Failed to create polling session');
      return { error: 'session_create_failed' };
    }
    const { sessionId } = await createResponse.json();
    pollingSessionId = sessionId;
    console.log('[GoogleOAuth] Created polling session:', pollingSessionId);
  } catch (e) {
    console.error('[GoogleOAuth] Error creating polling session:', e);
    return { error: 'session_create_failed' };
  }

  let authUrl: string;
  try {
    const startResponse = await fetch(`${apiUrl}/auth/start-polling/google?pollingSessionId=${encodeURIComponent(pollingSessionId)}`);
    if (!startResponse.ok) {
      console.error('[GoogleOAuth] Failed to get auth URL');
      return { error: 'auth_url_failed' };
    }
    const { authUrl: url } = await startResponse.json();
    authUrl = url;
    console.log('[GoogleOAuth] Got auth URL');
  } catch (e) {
    console.error('[GoogleOAuth] Error getting auth URL:', e);
    return { error: 'auth_url_failed' };
  }

  return new Promise(async (resolve) => {
    let resolved = false;

    if (googlePollingIntervalId) {
      clearInterval(googlePollingIntervalId);
    }
    if (googlePollingTimeoutId) {
      clearTimeout(googlePollingTimeoutId);
    }

    const cleanup = async () => {
      if (googlePollingIntervalId) {
        clearInterval(googlePollingIntervalId);
        googlePollingIntervalId = null;
      }
      if (googlePollingTimeoutId) {
        clearTimeout(googlePollingTimeoutId);
        googlePollingTimeoutId = null;
      }
      try {
        await Browser.removeAllListeners();
      } catch (e) {
        console.log('[GoogleOAuth] Browser cleanup error:', e);
      }
    };

    const pollForResult = async () => {
      if (resolved) return;
      try {
        const checkResponse = await fetch(`${apiUrl}/auth/polling-session/${pollingSessionId}`);
        if (!checkResponse.ok) {
          if (checkResponse.status === 404) {
            console.log('[GoogleOAuth] Polling session expired');
            resolved = true;
            await cleanup();
            resolve({ error: 'session_expired' });
          }
          return;
        }

        const data = await checkResponse.json();
        console.log('[GoogleOAuth] Poll result:', data.status);

        if (data.status === 'completed') {
          console.log('[GoogleOAuth] Login successful via polling!');
          resolved = true;
          await cleanup();
          resolve({
            token: data.token,
            isNewUser: data.isNewUser,
            user: data.user,
          });
        } else if (data.status === 'error') {
          console.log('[GoogleOAuth] Login error via polling:', data.error);
          resolved = true;
          await cleanup();
          resolve({ error: data.error || 'login_failed' });
        }
      } catch (e) {
        console.error('[GoogleOAuth] Polling error:', e);
      }
    };

    const handleBrowserFinished = () => {
      console.log('[GoogleOAuth] System browser closed');
      if (resolved) return;

      let retryCount = 0;
      const MAX_RETRIES = 10;
      const RETRY_INTERVAL = 1000;

      const retryPoll = async () => {
        if (resolved) return;
        retryCount++;
        console.log(`[GoogleOAuth] Post-close poll attempt ${retryCount}/${MAX_RETRIES}`);
        await pollForResult();
        if (!resolved && retryCount < MAX_RETRIES) {
          setTimeout(retryPoll, RETRY_INTERVAL);
        } else if (!resolved) {
          console.log('[GoogleOAuth] All post-close polls exhausted');
          resolved = true;
          await cleanup();
          resolve({ error: 'cancelled' });
        }
      };

      setTimeout(retryPoll, 500);
    };

    await Browser.addListener('browserFinished', handleBrowserFinished);

    googlePollingIntervalId = setInterval(pollForResult, 2000);

    googlePollingTimeoutId = setTimeout(async () => {
      if (!resolved) {
        console.log('[GoogleOAuth] Timeout reached (5 min)');
        resolved = true;
        await cleanup();
        resolve({ error: 'timeout' });
      }
    }, 5 * 60 * 1000);

    try {
      await Browser.open({ url: authUrl });
      console.log('[GoogleOAuth] System browser opened');
    } catch (err) {
      console.error('[GoogleOAuth] Failed to open system browser:', err);
      resolved = true;
      await cleanup();
      resolve({ error: 'browser_open_failed' });
    }
  });
}

export async function handleGoogleOAuthDeepLink(url: string): Promise<boolean> {
  console.log('[GoogleOAuth] handleGoogleOAuthDeepLink called (no-op with InAppBrowser):', url);
  return false;
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

    const providerTitles: Record<string, string> = {
      kakao: '카카오 로그인',
      naver: '네이버 로그인',
      google: '구글 로그인',
      apple: '애플 로그인',
    };
    const title = providerTitles[provider] || '로그인';
    
    try {
      await InAppBrowser.openWebView({ 
      url: authUrl, 
      title,
      isPresentAfterPageLoad: false,
      activeNativeNavigationForWebview: true,
    });
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

async function openNativeAppleSignIn(): Promise<OAuthResult> {
  const { SignInWithApple } = await import('@capacitor-community/apple-sign-in');
  const apiUrl = getApiBaseUrlDynamic();

  console.log('[AppleOAuth] === Starting Native Apple Sign In ===');

  try {
    const appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID;
    if (!appleClientId) {
      throw new Error('VITE_APPLE_CLIENT_ID 환경변수가 설정되지 않았습니다.');
    }
    console.log('[AppleOAuth] Using client_id from env');

    const result = await SignInWithApple.authorize({
      clientId: appleClientId,
      redirectURI: '',
      scopes: 'email name',
      state: '',
      nonce: '',
    });

    console.log('[AppleOAuth] Native sign in successful');
    console.log('[AppleOAuth] Has identityToken:', !!result.response.identityToken);
    console.log('[AppleOAuth] Has authorizationCode:', !!result.response.authorizationCode);
    console.log('[AppleOAuth] Has email:', !!result.response.email);

    const response = await fetch(`${apiUrl}/auth/apple/native-callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identityToken: result.response.identityToken,
        authorizationCode: result.response.authorizationCode,
        givenName: result.response.givenName,
        familyName: result.response.familyName,
        email: result.response.email,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[AppleOAuth] Backend error:', errorData);
      return { error: errorData.message || 'apple_login_failed' };
    }

    const data = await response.json();
    console.log('[AppleOAuth] Backend response:', JSON.stringify(data));

    if (data.requiresEmail) {
      return {
        requiresEmail: true,
        provider: data.tempData?.provider || 'apple',
        providerId: data.tempData?.providerUserId,
        name: data.tempData?.name,
      };
    }

    return {
      token: data.token,
      isNewUser: data.isNewUser,
      user: data.user,
    };
  } catch (error: any) {
    console.error('[AppleOAuth] Native sign in error:', error);

    if (error?.message?.includes('cancel') || error?.code === '1001' || error?.message?.includes('1001')) {
      return { error: 'cancelled' };
    }

    return { error: error?.message || 'apple_native_failed' };
  }
}

let applePollingIntervalId: ReturnType<typeof setInterval> | null = null;
let applePollingTimeoutId: ReturnType<typeof setTimeout> | null = null;

async function openInAppBrowserForAppleOAuth(): Promise<OAuthResult> {
  const apiUrl = getApiBaseUrlDynamic();

  console.log('[AppleOAuth] === Starting Apple OAuth with InAppBrowser + Polling ===');

  let pollingSessionId: string;
  try {
    const createResponse = await fetch(`${apiUrl}/auth/polling-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!createResponse.ok) {
      console.error('[AppleOAuth] Failed to create polling session');
      return { error: 'session_create_failed' };
    }
    const { sessionId } = await createResponse.json();
    pollingSessionId = sessionId;
    console.log('[AppleOAuth] Created polling session:', pollingSessionId);
  } catch (e) {
    console.error('[AppleOAuth] Error creating polling session:', e);
    return { error: 'session_create_failed' };
  }

  let authUrl: string;
  try {
    const startResponse = await fetch(`${apiUrl}/auth/start-polling/apple?pollingSessionId=${encodeURIComponent(pollingSessionId)}`);
    if (!startResponse.ok) {
      console.error('[AppleOAuth] Failed to get auth URL');
      return { error: 'auth_url_failed' };
    }
    const { authUrl: url } = await startResponse.json();
    authUrl = url;
    console.log('[AppleOAuth] Got auth URL');
  } catch (e) {
    console.error('[AppleOAuth] Error getting auth URL:', e);
    return { error: 'auth_url_failed' };
  }

  return new Promise(async (resolve) => {
    let resolved = false;

    if (applePollingIntervalId) {
      clearInterval(applePollingIntervalId);
    }
    if (applePollingTimeoutId) {
      clearTimeout(applePollingTimeoutId);
    }

    const cleanup = async () => {
      if (applePollingIntervalId) {
        clearInterval(applePollingIntervalId);
        applePollingIntervalId = null;
      }
      if (applePollingTimeoutId) {
        clearTimeout(applePollingTimeoutId);
        applePollingTimeoutId = null;
      }
      try {
        await InAppBrowser.removeAllListeners();
        await InAppBrowser.close();
      } catch (e) {
        console.log('[AppleOAuth] InAppBrowser close error (may be already closed):', e);
      }
    };

    const pollForResult = async () => {
      if (resolved) return;
      try {
        const checkResponse = await fetch(`${apiUrl}/auth/polling-session/${pollingSessionId}`);
        if (!checkResponse.ok) {
          if (checkResponse.status === 404) {
            console.log('[AppleOAuth] Polling session expired');
            resolved = true;
            await cleanup();
            resolve({ error: 'session_expired' });
          }
          return;
        }

        const data = await checkResponse.json();
        console.log('[AppleOAuth] Poll result:', data.status);

        if (data.status === 'completed') {
          console.log('[AppleOAuth] Login successful via polling!');
          resolved = true;
          await cleanup();
          if (data.requiresEmail) {
            resolve({
              requiresEmail: true,
              provider: data.provider,
              providerId: data.providerId,
              name: data.name,
            });
          } else {
            resolve({
              token: data.token,
              isNewUser: data.isNewUser,
              user: data.user,
            });
          }
        } else if (data.status === 'error') {
          console.log('[AppleOAuth] Login error via polling:', data.error);
          resolved = true;
          await cleanup();
          resolve({ error: data.error || 'login_failed' });
        }
      } catch (e) {
        console.error('[AppleOAuth] Polling error:', e);
      }
    };

    const handleUrlChange = async (event: UrlEvent) => {
      const url = event.url;
      console.log('[AppleOAuth] URL changed:', url);

      if (url.includes('/social-callback') && !resolved) {
        try {
          const urlObj = new URL(url);
          const key = urlObj.searchParams.get('key');

          if (key) {
            resolved = true;
            console.log('[AppleOAuth] Detected callback with key:', key);
            await cleanup();
            const result = await fetchSessionData(key);
            resolve(result);
          }
        } catch (e) {
          console.error('[AppleOAuth] Error parsing callback URL:', e);
        }
      }
    };

    const handleClose = () => {
      console.log('[AppleOAuth] InAppBrowser closed');
      if (resolved) return;

      let retryCount = 0;
      const MAX_RETRIES = 10;
      const RETRY_INTERVAL = 1000;

      const retryPoll = async () => {
        if (resolved) return;
        retryCount++;
        console.log(`[AppleOAuth] Post-close poll attempt ${retryCount}/${MAX_RETRIES}`);
        await pollForResult();
        if (!resolved && retryCount < MAX_RETRIES) {
          setTimeout(retryPoll, RETRY_INTERVAL);
        } else if (!resolved) {
          console.log('[AppleOAuth] All post-close polls exhausted');
          resolved = true;
          await cleanup();
          resolve({ error: 'cancelled' });
        }
      };

      setTimeout(retryPoll, 500);
    };

    await InAppBrowser.addListener('urlChangeEvent', handleUrlChange);
    await InAppBrowser.addListener('closeEvent', handleClose);

    applePollingIntervalId = setInterval(pollForResult, 2000);

    applePollingTimeoutId = setTimeout(async () => {
      if (!resolved) {
        console.log('[AppleOAuth] Timeout reached (5 min)');
        resolved = true;
        await cleanup();
        resolve({ error: 'timeout' });
      }
    }, 5 * 60 * 1000);

    try {
      await InAppBrowser.openWebView({
        url: authUrl,
        title: '애플 로그인',
        isPresentAfterPageLoad: false,
        activeNativeNavigationForWebview: true,
      });
      console.log('[AppleOAuth] InAppBrowser opened');
    } catch (err) {
      console.error('[AppleOAuth] Failed to open InAppBrowser:', err);
      resolved = true;
      if (applePollingIntervalId) {
        clearInterval(applePollingIntervalId);
        applePollingIntervalId = null;
      }
      if (applePollingTimeoutId) {
        clearTimeout(applePollingTimeoutId);
        applePollingTimeoutId = null;
      }
      await InAppBrowser.removeAllListeners();
      resolve({ error: 'browser_open_failed' });
    }
  });
}

export async function appleAuthorize(): Promise<OAuthResult | void> {
  const isCapacitor = checkIsCapacitor();
  console.log('[AppleOAuth] appleAuthorize called, isCapacitor:', isCapacitor);

  if (isCapacitor) {
    return await openInAppBrowserForAppleOAuth();
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
