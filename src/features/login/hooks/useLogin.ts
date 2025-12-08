import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LOGIN_ROUTES, SOCIAL_PROVIDERS } from '../constants';

export function useLogin() {
  const navigate = useNavigate();

  const onKakaoLogin = useCallback(() => {
    console.log(`${SOCIAL_PROVIDERS.KAKAO} 로그인 시도`);
  }, []);

  const onNaverLogin = useCallback(() => {
    console.log(`${SOCIAL_PROVIDERS.NAVER} 로그인 시도`);
  }, []);

  const onEmailLogin = useCallback(() => {
    navigate(LOGIN_ROUTES.EMAIL_LOGIN);
  }, [navigate]);

  const onEmailSignup = useCallback(() => {
    navigate(LOGIN_ROUTES.EMAIL_SIGNUP);
  }, [navigate]);

  const onGuestOrder = useCallback(() => {
    navigate(LOGIN_ROUTES.GUEST_ORDER);
  }, [navigate]);

  const onClose = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
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
