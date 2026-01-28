import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { socialLogin, isRequiresEmailResponse, AccountSuspendedError, SocialProvider } from '../api/socialAuthApi';
import { fetchHomeData } from '../../home/api/homeDataApi';
import { getApiBaseUrlDynamic } from '@/shared/config/apiConfig';
interface SessionData {
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

export default function SocialAuthCallbackPage() {
  const { provider } = useParams<{ provider: SocialProvider }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    async function handleCallback() {
      if (isProcessingRef.current) {
        return;
      }
      isProcessingRef.current = true;
      
      const key = searchParams.get('key');
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');
      const idToken = searchParams.get('id_token');
      const userName = searchParams.get('user_name');
      const tokenFromUrl = searchParams.get('token');
      const isNewUserFromUrl = searchParams.get('isNewUser') === 'true';
      const requiresEmailFromUrl = searchParams.get('requiresEmail') === 'true';
      const providerIdFromUrl = searchParams.get('providerId');

      console.log('[OAuth Callback] === Debug Info ===');
      console.log('[OAuth Callback] provider:', provider);
      console.log('[OAuth Callback] key:', key);
      console.log('[OAuth Callback] code:', code ? `${code.substring(0, 10)}...` : 'NULL');
      console.log('[OAuth Callback] state from URL:', state);
      console.log('[OAuth Callback] error:', errorParam);
      console.log('[OAuth Callback] Full URL:', window.location.href);
      
      if (provider === 'naver') {
        const savedState = sessionStorage.getItem('naver_oauth_state');
        console.log('[OAuth Callback] savedState from sessionStorage:', savedState);
      }

      if (errorParam) {
        console.log('[OAuth Callback] Error param detected:', errorParam);
        setError('로그인이 취소되었습니다.');
        setIsLoading(false);
        return;
      }

      if (key) {
        console.log('[OAuth Callback] Processing session key:', key);
        try {
          const response = await fetch(`${getApiBaseUrlDynamic()}/auth/session/${key}`);
          if (!response.ok) {
            console.log('[OAuth Callback] Session fetch failed, status:', response.status);
            setError('세션이 만료되었습니다. 다시 시도해주세요.');
            setIsLoading(false);
            return;
          }
          
          const sessionData: SessionData = await response.json();
          console.log('[OAuth Callback] Session data:', sessionData);
          
          if (sessionData.error) {
            setError(sessionData.error === 'session_expired' ? '세션이 만료되었습니다. 다시 시도해주세요.' : '로그인에 실패했습니다.');
            setIsLoading(false);
            return;
          }
          
          if (sessionData.requiresEmail && sessionData.providerId) {
            navigate('/login/social/email', {
              state: {
                provider: sessionData.provider || provider,
                providerUserId: sessionData.providerId,
                name: sessionData.name || '',
                profileImage: sessionData.profileImage || null,
              },
              replace: true,
            });
            return;
          }
          
          if (sessionData.token && sessionData.user) {
            if (sessionData.isNewUser) {
              const signupFormData = {
                email: sessionData.user.email,
                isEmailVerified: true,
                isCodeSent: true,
                verificationCode: '',
                password: 'SOCIAL_LOGIN_NO_PASSWORD',
                passwordConfirm: 'SOCIAL_LOGIN_NO_PASSWORD',
                showPassword: false,
                showPasswordConfirm: false,
                isPasswordSet: true,
                name: sessionData.user.name || '',
                phone: '',
                isPhoneVerified: false,
                addressName: '',
                zonecode: '',
                address: '',
                addressDetail: '',
                birthYear: '',
                birthMonth: '',
                birthDay: '',
                gender: '',
                referralId: '',
                isReferralIdVerified: false,
                isOver14: false,
                termsAgreed: false,
                privacyAgreed: false,
                socialProvider: sessionData.provider || provider,
              };
              sessionStorage.setItem('signupFormData', JSON.stringify(signupFormData));
              sessionStorage.setItem('pendingSocialLogin', JSON.stringify({
                token: sessionData.token,
                user: sessionData.user,
              }));
              navigate('/signup/email', { replace: true });
            } else {
              loginWithToken(sessionData.token, {
                id: String(sessionData.user.id),
                email: sessionData.user.email,
                name: sessionData.user.name,
              });
              queryClient.prefetchQuery({
                queryKey: ['homeData'],
                queryFn: fetchHomeData,
              });
              navigate('/', { replace: true });
            }
            return;
          }
          
          setError('로그인 정보를 확인할 수 없습니다.');
          setIsLoading(false);
          return;
        } catch (err) {
          console.error('[OAuth Callback] Session fetch error:', err);
          const message = err instanceof Error ? err.message : '로그인에 실패했습니다.';
          setError(message);
          setIsLoading(false);
          return;
        }
      }

      if (tokenFromUrl && provider) {
        try {
          const { fetchUserProfile } = await import('../api/socialAuthApi');
          const userProfile = await fetchUserProfile(tokenFromUrl);
          
          if (isNewUserFromUrl) {
            const signupFormData = {
              email: userProfile.email,
              isEmailVerified: true,
              isCodeSent: true,
              verificationCode: '',
              password: 'SOCIAL_LOGIN_NO_PASSWORD',
              passwordConfirm: 'SOCIAL_LOGIN_NO_PASSWORD',
              showPassword: false,
              showPasswordConfirm: false,
              isPasswordSet: true,
              name: userProfile.name || '',
              phone: '',
              isPhoneVerified: false,
              addressName: '',
              zonecode: '',
              address: '',
              addressDetail: '',
              birthYear: '',
              birthMonth: '',
              birthDay: '',
              gender: '',
              referralId: '',
              isReferralIdVerified: false,
              isOver14: false,
              termsAgreed: false,
              privacyAgreed: false,
              socialProvider: provider,
            };
            sessionStorage.setItem('signupFormData', JSON.stringify(signupFormData));
            sessionStorage.setItem('pendingSocialLogin', JSON.stringify({
              token: tokenFromUrl,
              user: userProfile,
            }));
            navigate('/signup/email', { replace: true });
          } else {
            loginWithToken(tokenFromUrl, {
              id: userProfile.id,
              email: userProfile.email,
              name: userProfile.name,
            });
            queryClient.prefetchQuery({
              queryKey: ['homeData'],
              queryFn: fetchHomeData,
            });
            navigate('/', { replace: true });
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : '로그인에 실패했습니다.';
          setError(message);
          setIsLoading(false);
        }
        return;
      }

      if (requiresEmailFromUrl && providerIdFromUrl) {
        const nameFromUrl = searchParams.get('name') || '';
        navigate('/login/social/email', {
          state: {
            provider: provider,
            providerUserId: providerIdFromUrl,
            name: nameFromUrl,
            profileImage: null,
          },
          replace: true,
        });
        return;
      }

      if (!code || !provider) {
        console.log('[OAuth Callback] FAIL: Missing code or provider');
        setError('인증 정보가 올바르지 않습니다.');
        setIsLoading(false);
        return;
      }

      const validProviders: SocialProvider[] = ['kakao', 'naver', 'google', 'apple'];
      if (!validProviders.includes(provider as SocialProvider)) {
        console.log('[OAuth Callback] FAIL: Invalid provider:', provider);
        setError('지원하지 않는 로그인 방식입니다.');
        setIsLoading(false);
        return;
      }

      if (provider === 'naver') {
        const savedState = sessionStorage.getItem('naver_oauth_state');
        console.log('[OAuth Callback] Naver state check - URL state:', state, 'Saved state:', savedState);
        if (state !== savedState) {
          console.log('[OAuth Callback] FAIL: Naver state mismatch!');
          setError('보안 검증에 실패했습니다.');
          setIsLoading(false);
          return;
        }
        sessionStorage.removeItem('naver_oauth_state');
        console.log('[OAuth Callback] Naver state validation passed');
      }

      if (provider === 'google') {
        const savedState = sessionStorage.getItem('google_oauth_state');
        if (state !== savedState) {
          setError('보안 검증에 실패했습니다.');
          setIsLoading(false);
          return;
        }
        sessionStorage.removeItem('google_oauth_state');
      }

      if (provider === 'apple') {
        const savedState = sessionStorage.getItem('apple_oauth_state');
        if (state !== savedState) {
          setError('보안 검증에 실패했습니다.');
          setIsLoading(false);
          return;
        }
        sessionStorage.removeItem('apple_oauth_state');
      }

      try {
        console.log('[OAuth Callback] Calling socialLogin API...');
        const appleParams = provider === 'apple' ? { idToken: idToken || undefined, userName: userName || undefined } : undefined;
        const baseUrl = import.meta.env.VITE_SOCIAL_REDIRECT_BASE_URL || '';
        const webRedirectUri = `${baseUrl}/oauth/${provider}/callback`;
        console.log('[OAuth Callback] Using redirectUri:', webRedirectUri);
        const result = await socialLogin(provider as SocialProvider, code, state || undefined, appleParams, webRedirectUri);
        console.log('[OAuth Callback] socialLogin result:', result);

        if (isRequiresEmailResponse(result)) {
          navigate('/login/social/email', {
            state: {
              provider: result.tempData.provider,
              providerUserId: result.tempData.providerUserId,
              name: result.tempData.name,
              profileImage: result.tempData.profileImage,
            },
            replace: true,
          });
          return;
        }

        if (result.isNewUser) {
          const signupFormData = {
            email: result.user.email,
            isEmailVerified: true,
            isCodeSent: true,
            verificationCode: '',
            password: 'SOCIAL_LOGIN_NO_PASSWORD',
            passwordConfirm: 'SOCIAL_LOGIN_NO_PASSWORD',
            showPassword: false,
            showPasswordConfirm: false,
            isPasswordSet: true,
            name: result.user.name || '',
            phone: '',
            isPhoneVerified: false,
            addressName: '',
            zonecode: '',
            address: '',
            addressDetail: '',
            birthYear: '',
            birthMonth: '',
            birthDay: '',
            gender: '',
            referralId: '',
            isReferralIdVerified: false,
            isOver14: false,
            termsAgreed: false,
            privacyAgreed: false,
            socialProvider: provider,
          };
          sessionStorage.setItem('signupFormData', JSON.stringify(signupFormData));
          sessionStorage.setItem('pendingSocialLogin', JSON.stringify({
            token: result.token,
            user: result.user,
          }));
          navigate('/signup/email', { replace: true });
        } else {
          loginWithToken(result.token, {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
          });
          queryClient.prefetchQuery({
            queryKey: ['homeData'],
            queryFn: fetchHomeData,
          });
          navigate('/', { replace: true });
        }
      } catch (err) {
        if (err instanceof AccountSuspendedError) {
          const { triggerGlobalAlert } = await import('../../../contexts/AlertModalContext');
          triggerGlobalAlert('활동이 제한된 계정입니다', '/login');
          return;
        }
        const message = err instanceof Error ? err.message : '로그인에 실패했습니다.';
        setError(message);
        setIsLoading(false);
      }
    }

    handleCallback();
  }, [provider, searchParams, navigate, loginWithToken, queryClient]);

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        background: '#ffffff', 
        padding: '16px' 
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '24px', 
          textAlign: 'center' 
        }}>
          <p style={{ 
            fontFamily: 'var(--font-family-base)', 
            fontSize: '16px', 
            color: 'rgba(12, 12, 12, 0.8)', 
            lineHeight: '1.5' 
          }}>{error}</p>
          <button
            style={{
              padding: '12px 24px',
              background: 'var(--color-primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'var(--font-family-base)',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/login', { replace: true })}
          >
            로그인 화면으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return null;
}
