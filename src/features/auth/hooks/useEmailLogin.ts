import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUTH_ROUTES } from '../constants';

export function useEmailLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValid = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && password.length >= 6;
  }, [email, password]);

  const onEmailChange = useCallback((value: string) => {
    setEmail(value);
  }, []);

  const onPasswordChange = useCallback((value: string) => {
    setPassword(value);
  }, []);

  const onSubmit = useCallback(async () => {
    if (!isValid || isLoading) return;

    setIsLoading(true);
    try {
      console.log('이메일 로그인 시도:', { email });
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('로그인 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [email, isValid, isLoading]);

  const onForgotPassword = useCallback(() => {
    console.log('비밀번호 찾기로 이동');
  }, []);

  const onBack = useCallback(() => {
    navigate(AUTH_ROUTES.LOGIN);
  }, [navigate]);

  return {
    emailLogin: {
      email,
      password,
      isLoading,
      isValid,
      onEmailChange,
      onPasswordChange,
      onSubmit,
      onForgotPassword,
      onBack,
    },
  };
}
