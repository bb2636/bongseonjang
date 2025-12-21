import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { socialLogin, isRequiresEmailResponse } from '../api/socialAuthApi';
import { fetchHomeData } from '../../home/api/homeDataApi';
import './SocialAuthCallbackPage.css';

export default function SocialAuthCallbackPage() {
  const { provider } = useParams<{ provider: 'kakao' | 'naver' }>();
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
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('로그인이 취소되었습니다.');
        setIsLoading(false);
        return;
      }

      if (!code || !provider) {
        setError('인증 정보가 올바르지 않습니다.');
        setIsLoading(false);
        return;
      }

      if (provider === 'naver') {
        const savedState = sessionStorage.getItem('naver_oauth_state');
        if (state !== savedState) {
          setError('보안 검증에 실패했습니다.');
          setIsLoading(false);
          return;
        }
        sessionStorage.removeItem('naver_oauth_state');
      }

      try {
        const result = await socialLogin(provider, code, state || undefined);

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
        const message = err instanceof Error ? err.message : '로그인에 실패했습니다.';
        setError(message);
        setIsLoading(false);
      }
    }

    handleCallback();
  }, [provider, searchParams, navigate, loginWithToken, queryClient]);

  if (error) {
    return (
      <div className="social-callback-container">
        <div className="social-callback-error">
          <p className="social-callback-error-message">{error}</p>
          <button
            className="social-callback-retry-button"
            onClick={() => navigate('/login', { replace: true })}
          >
            로그인 화면으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="social-callback-container">
        <div className="social-callback-loading">
          <div className="social-callback-spinner" />
          <p className="social-callback-loading-text">로그인 중...</p>
        </div>
      </div>
    );
  }

  return null;
}
