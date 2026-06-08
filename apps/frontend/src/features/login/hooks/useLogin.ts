import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { LOGIN_ROUTES } from '../constants';
import { kakaoAuthorize, naverAuthorize, googleAuthorize, appleAuthorize, OAuthResult } from '../services/socialSdkService';
import { clearFormDataFromStorage } from '../../signup/hooks/useSignupFormState';
import { fetchUserProfile } from '../api/socialAuthApi';
import { fetchHomeData } from '../../home/api/homeDataApi';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';

function getErrorMessage(error: string): string {
  switch (error) {
    case 'cancelled':
    case 'timeout':
      return '';
    case 'browser_open_failed':
      return '브라우저를 열 수 없습니다. 다시 시도해주세요.';
    case 'state_mismatch':
      return '보안 검증에 실패했습니다. 다시 시도해주세요.';
    case 'token_exchange_failed':
      return '로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.';
    case 'user_info_failed':
      return '사용자 정보를 가져올 수 없습니다. 다시 시도해주세요.';
    case 'parse_failed':
      return '로그인 응답을 처리할 수 없습니다. 다시 시도해주세요.';
    case 'callback_failed':
      return '로그인 콜백 처리 중 오류가 발생했습니다.';
    case 'ACCOUNT_SUSPENDED':
      return '활동이 제한된 계정입니다.';
    default:
      return `로그인 중 오류가 발생했습니다: ${error}`;
  }
}

export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { loginWithToken } = useAuth();
  const { showToast } = useToast();

  const handleOAuthResult = useCallback(async (result: OAuthResult, provider: string) => {
    if (result.error) {
      if (result.error === 'cancelled' || result.error === 'timeout') {
        return;
      }
      console.error('OAuth 오류:', result.error);
      const errorMessage = getErrorMessage(result.error);
      if (errorMessage) {
        showToast(errorMessage, 'error');
      }
      return;
    }

    if (result.requiresEmail && result.provider && result.providerId) {
      navigate('/login/social/email', {
        state: {
          provider: result.provider,
          providerUserId: result.providerId,
          name: '',
          profileImage: null,
        },
        replace: true,
      });
      return;
    }

    if (result.token) {
      try {
        const userProfile = await fetchUserProfile(result.token);
        
        if (result.isNewUser) {
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
            user: userProfile,
          }));
          navigate('/signup/email', { replace: true });
        } else {
          loginWithToken(result.token, {
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
        console.error('OAuth 로그인 완료 오류:', err);
        showToast('로그인 처리 중 오류가 발생했습니다.', 'error');
      }
    }
  }, [navigate, loginWithToken, queryClient, showToast]);

  const onKakaoLogin = useCallback(async () => {
    console.log('[SocialLogin] 카카오 로그인 버튼 클릭');
    try {
      const result = await kakaoAuthorize();
      console.log('[SocialLogin] 카카오 결과:', result);
      if (result) {
        await handleOAuthResult(result, 'kakao');
      }
    } catch (error) {
      console.error('[SocialLogin] 카카오 로그인 오류:', error);
      showToast('카카오 로그인 중 오류가 발생했습니다.', 'error');
    }
  }, [handleOAuthResult, showToast]);

  const onNaverLogin = useCallback(async () => {
    console.log('[SocialLogin] 네이버 로그인 버튼 클릭');
    try {
      const result = await naverAuthorize();
      console.log('[SocialLogin] 네이버 결과:', result);
      if (result) {
        await handleOAuthResult(result, 'naver');
      }
    } catch (error) {
      console.error('[SocialLogin] 네이버 로그인 오류:', error);
      showToast('네이버 로그인 중 오류가 발생했습니다.', 'error');
    }
  }, [handleOAuthResult, showToast]);

  const onGoogleLogin = useCallback(async () => {
    console.log('[SocialLogin] 구글 로그인 버튼 클릭');
    try {
      const result = await googleAuthorize();
      console.log('[SocialLogin] 구글 결과:', result);
      if (result) {
        await handleOAuthResult(result, 'google');
      }
    } catch (error) {
      console.error('[SocialLogin] 구글 로그인 오류:', error);
      showToast('구글 로그인 중 오류가 발생했습니다.', 'error');
    }
  }, [handleOAuthResult, showToast]);

  const onAppleLogin = useCallback(async () => {
    console.log('[SocialLogin] 애플 로그인 버튼 클릭');
    try {
      const result = await appleAuthorize();
      console.log('[SocialLogin] 애플 결과:', result);
      if (result) {
        await handleOAuthResult(result, 'apple');
      }
    } catch (error) {
      console.error('[SocialLogin] 애플 로그인 오류:', error);
      showToast('애플 로그인 중 오류가 발생했습니다.', 'error');
    }
  }, [handleOAuthResult, showToast]);

  const onEmailLogin = useCallback(() => {
    navigate(LOGIN_ROUTES.EMAIL_LOGIN, { replace: true });
  }, [navigate]);

  const onEmailSignup = useCallback(() => {
    clearFormDataFromStorage();
    navigate(LOGIN_ROUTES.EMAIL_SIGNUP);
  }, [navigate]);

  const onGuestOrder = useCallback(() => {
    navigate(LOGIN_ROUTES.GUEST_ORDER);
  }, [navigate]);

  const onBrowse = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return {
    login: {
      onKakaoLogin,
      onNaverLogin,
      onGoogleLogin,
      onAppleLogin,
      onEmailLogin,
      onEmailSignup,
      onGuestOrder,
      onBrowse,
    },
  };
}
