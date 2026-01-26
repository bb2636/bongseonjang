import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { LOGIN_ROUTES } from '../constants';
import { kakaoAuthorize, naverAuthorize, googleAuthorize, appleAuthorize, OAuthResult } from '../services/socialSdkService';
import { clearFormDataFromStorage } from '../../signup/hooks/useSignupFormState';
import { fetchUserProfile } from '../api/socialAuthApi';
import { fetchHomeData } from '../../home/api/homeDataApi';
import { useAuth } from '../../../contexts/AuthContext';

export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { loginWithToken } = useAuth();

  const handleOAuthResult = useCallback(async (result: OAuthResult, provider: string) => {
    if (result.error) {
      if (result.error === 'cancelled') {
        return;
      }
      console.error('OAuth 오류:', result.error);
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
      }
    }
  }, [navigate, loginWithToken, queryClient]);

  const onKakaoLogin = useCallback(async () => {
    try {
      const result = await kakaoAuthorize();
      if (result) {
        await handleOAuthResult(result, 'kakao');
      }
    } catch (error) {
      console.error('카카오 로그인 설정이 올바르지 않습니다.', error);
    }
  }, [handleOAuthResult]);

  const onNaverLogin = useCallback(async () => {
    try {
      const result = await naverAuthorize();
      if (result) {
        await handleOAuthResult(result, 'naver');
      }
    } catch (error) {
      console.error('네이버 로그인 설정이 올바르지 않습니다.', error);
    }
  }, [handleOAuthResult]);

  const onGoogleLogin = useCallback(async () => {
    try {
      const result = await googleAuthorize();
      if (result) {
        await handleOAuthResult(result, 'google');
      }
    } catch (error) {
      console.error('구글 로그인 설정이 올바르지 않습니다.', error);
    }
  }, [handleOAuthResult]);

  const onAppleLogin = useCallback(async () => {
    try {
      const result = await appleAuthorize();
      if (result) {
        await handleOAuthResult(result, 'apple');
      }
    } catch (error) {
      console.error('애플 로그인 설정이 올바르지 않습니다.', error);
    }
  }, [handleOAuthResult]);

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
