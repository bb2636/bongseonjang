import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LOGIN_ROUTES } from '../constants';
import { getKakaoAuthUrl, getNaverAuthUrl } from '../api/socialAuthApi';

export function useLogin() {
  const navigate = useNavigate();

  const onKakaoLogin = useCallback(() => {
    try {
      const authUrl = getKakaoAuthUrl();
      window.location.href = authUrl;
    } catch {
      console.error('카카오 로그인 설정이 올바르지 않습니다.');
    }
  }, []);

  const onNaverLogin = useCallback(() => {
    try {
      const authUrl = getNaverAuthUrl();
      window.location.href = authUrl;
    } catch {
      console.error('네이버 로그인 설정이 올바르지 않습니다.');
    }
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
