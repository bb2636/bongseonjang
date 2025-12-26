import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LOGIN_ROUTES } from '../constants';
import { kakaoAuthorize, naverAuthorize } from '../services/socialSdkService';
import { clearFormDataFromStorage } from '../../signup/hooks/useSignupFormState';

export function useLogin() {
  const navigate = useNavigate();

  const onKakaoLogin = useCallback(() => {
    try {
      kakaoAuthorize();
    } catch (error) {
      console.error('카카오 로그인 설정이 올바르지 않습니다.', error);
    }
  }, []);

  const onNaverLogin = useCallback(async () => {
    try {
      await naverAuthorize();
    } catch (error) {
      console.error('네이버 로그인 설정이 올바르지 않습니다.', error);
    }
  }, []);

  const onEmailLogin = useCallback(() => {
    navigate(LOGIN_ROUTES.EMAIL_LOGIN);
  }, [navigate]);

  const onEmailSignup = useCallback(() => {
    clearFormDataFromStorage();
    navigate(LOGIN_ROUTES.EMAIL_SIGNUP);
  }, [navigate]);

  const onGuestOrder = useCallback(() => {
    navigate(LOGIN_ROUTES.GUEST_ORDER);
  }, [navigate]);

  const onClose = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return {
    login: {
      onKakaoLogin,
      onNaverLogin,
      onEmailLogin,
      onEmailSignup,
      onGuestOrder,
      onClose,
    },
  };
}
