import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { LOGIN_ROUTES } from '../constants';
import { loginService } from '../services/loginService';
import { useAuth } from '../../../contexts/AuthContext';

interface FieldError {
  email: string | null;
  password: string | null;
}

export function useEmailLogin() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldError>({ email: null, password: null });
  const [touched, setTouched] = useState({ email: false, password: false });

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) => loginService.loginWithEmail(data.email, data.password),
    onSuccess: (data) => {
      if (data.token && data.user) {
        loginWithToken(data.token, {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
        });
      }
      navigate('/');
    },
    onError: (error: Error) => {
      setErrors(prev => ({ ...prev, password: error.message || '로그인에 실패했습니다' }));
    },
  });

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

  const onSubmit = useCallback(() => {
    setTouched({ email: true, password: true });
    
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    setErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) {
      return;
    }

    if (loginMutation.isPending) return;

    loginMutation.mutate({ email, password });
  }, [email, password, loginMutation, validateEmail, validatePassword]);

  const onForgotPassword = useCallback(() => {
    navigate(LOGIN_ROUTES.PASSWORD_RESET);
  }, [navigate]);

  const onBack = useCallback(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  return {
    emailLogin: {
      email,
      password,
      isLoading: loginMutation.isPending,
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
