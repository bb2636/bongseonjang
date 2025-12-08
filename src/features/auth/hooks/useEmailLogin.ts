import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUTH_ROUTES } from '../constants';

interface FieldError {
  email: string | null;
  password: string | null;
}

export function useEmailLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FieldError>({ email: null, password: null });
  const [touched, setTouched] = useState({ email: false, password: false });

  const validateEmail = useCallback((value: string): string | null => {
    if (!value.trim()) {
      return '이메일을 입력해주세요.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return '올바른 이메일 형식이 아닙니다.';
    }
    return null;
  }, []);

  const validatePassword = useCallback((value: string): string | null => {
    if (!value) {
      return '비밀번호를 입력해주세요.';
    }
    if (value.length < 6) {
      return '비밀번호는 6자 이상이어야 합니다.';
    }
    return null;
  }, []);

  const isValid = useMemo(() => {
    return !validateEmail(email) && !validatePassword(password);
  }, [email, password, validateEmail, validatePassword]);

  const onEmailChange = useCallback((value: string) => {
    setEmail(value);
    if (touched.email) {
      setErrors(prev => ({ ...prev, email: validateEmail(value) }));
    }
  }, [touched.email, validateEmail]);

  const onPasswordChange = useCallback((value: string) => {
    setPassword(value);
    if (touched.password) {
      setErrors(prev => ({ ...prev, password: validatePassword(value) }));
    }
  }, [touched.password, validatePassword]);

  const onEmailBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, email: true }));
    setErrors(prev => ({ ...prev, email: validateEmail(email) }));
  }, [email, validateEmail]);

  const onPasswordBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, password: true }));
    setErrors(prev => ({ ...prev, password: validatePassword(password) }));
  }, [password, validatePassword]);

  const onSubmit = useCallback(async () => {
    setTouched({ email: true, password: true });
    
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    setErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) {
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      console.log('이메일 로그인 시도:', { email });
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('로그인 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, isLoading, validateEmail, validatePassword]);

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
      errors,
      onEmailChange,
      onPasswordChange,
      onEmailBlur,
      onPasswordBlur,
      onSubmit,
      onForgotPassword,
      onBack,
    },
  };
}
