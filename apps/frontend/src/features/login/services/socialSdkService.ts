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
let googlePollingIntervalId: ReturnType<typeof setInterval> | null = null;

async function openSystemBrowserForGoogleOAuth(): Promise<OAuthResult> {
  const apiUrl = getApiBaseUrlDynamic();
  
  console.log('[GoogleOAuth] === Starting Google OAuth with Polling Flow ===');
  
  // Step 1: Create polling session
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
  
  // Step 2: Get auth URL with polling session
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
    googleOAuthResolver = resolve;
    
    // Clear any existing timeout/interval
    if (googleOAuthTimeoutId) {
      clearTimeout(googleOAuthTimeoutId);
    }
    if (googlePollingIntervalId) {
      clearInterval(googlePollingIntervalId);
    }
    
    // Step 3: Start polling for result
    const pollForResult = async () => {
      try {
        const checkResponse = await fetch(`${apiUrl}/auth/polling-session/${pollingSessionId}`);
        if (!checkResponse.ok) {
          if (checkResponse.status === 404) {
            console.log('[GoogleOAuth] Polling session expired');
            cleanup();
            resolve({ error: 'session_expired' });
          }
          return;
        }
        
        const data = await checkResponse.json();
        console.log('[GoogleOAuth] Poll result:', data.status);
        
        if (data.status === 'completed') {
          console.log('[GoogleOAuth] Login successful via polling!');
          cleanup();
          resolve({
            token: data.token,
            isNewUser: data.isNewUser,
            user: data.user,
          });
        } else if (data.status === 'error') {
          console.log('[GoogleOAuth] Login error via polling:', data.error);
          cleanup();
          resolve({ error: data.error || 'login_failed' });
        }
        // status === 'pending' means keep polling
      } catch (e) {
        console.error('[GoogleOAuth] Polling error:', e);
      }
    };
    
    const cleanup = async () => {
      if (googlePollingIntervalId) {
        clearInterval(googlePollingIntervalId);
        googlePollingIntervalId = null;
      }
      if (googleOAuthTimeoutId) {
        clearTimeout(googleOAuthTimeoutId);
        googleOAuthTimeoutId = null;
      }
      googleOAuthResolver = null;
      try {
        await Browser.close();
      } catch (e) {
        console.log('[GoogleOAuth] Browser close error (may be already closed):', e);
      }
    };
    
    // Poll every 2 seconds
    googlePollingIntervalId = setInterval(pollForResult, 2000);
    
    // Timeout after 5 minutes
    googleOAuthTimeoutId = setTimeout(async () => {
      console.log('[GoogleOAuth] Timeout reached (5 min)');
      cleanup();
      resolve({ error: 'timeout' });
    }, 5 * 60 * 1000);

    // Step 4: Open browser
    try {
      await Browser.open({ url: authUrl, windowName: '_blank' });
      console.log('[GoogleOAuth] System browser opened successfully');
    } catch (err) {
      console.error('[GoogleOAuth] Failed to open system browser:', err);
      cleanup();
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
      isPresentAfterPageLoad: true,
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
    console.log('[AppleOAuth] Full result keys:', Object.keys(result));
    console.log('[AppleOAuth] Response keys:', result.response ? Object.keys(result.response) : 'no response');
    console.log('[AppleOAuth] Has identityToken:', !!result.response.identityToken);
    console.log('[AppleOAuth] identityToken type:', typeof result.response.identityToken);
    console.log('[AppleOAuth] identityToken length:', result.response.identityToken?.length);
    console.log('[AppleOAuth] identityToken first 50 chars:', result.response.identityToken?.substring(0, 50));
    console.log('[AppleOAuth] identityToken dot count:', result.response.identityToken?.split('.').length);
    console.log('[AppleOAuth] Has authorizationCode:', !!result.response.authorizationCode);
    console.log('[AppleOAuth] Has email:', !!result.response.email);
    console.log('[AppleOAuth] Has givenName:', !!result.response.givenName);
    console.log('[AppleOAuth] Has familyName:', !!result.response.familyName);
    console.log('[AppleOAuth] user (sub):', result.response.user);

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

export async function appleAuthorize(): Promise<OAuthResult | void> {
  const isCapacitor = checkIsCapacitor();
  console.log('[AppleOAuth] appleAuthorize called, isCapacitor:', isCapacitor);

  if (isCapacitor) {
    return await openNativeAppleSignIn();
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
