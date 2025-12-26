import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

interface PasswordResetRequestResponse {
  success: boolean;
  message: string;
}

async function requestPasswordReset(email: string): Promise<PasswordResetRequestResponse> {
  const response = await fetch('/api/auth/password-reset/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || '비밀번호 재설정 요청에 실패했습니다');
  }
  
  return data;
}

export function usePasswordResetRequest() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: () => {
      setIsSuccess(true);
    },
    onError: (err: Error) => {
      setError(err.message);
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

  const isValid = useMemo(() => {
    return !validateEmail(email);
  }, [email, validateEmail]);

  const onEmailChange = useCallback((value: string) => {
    setEmail(value);
    if (touched) {
      setError(validateEmail(value));
    }
  }, [touched, validateEmail]);

  const onEmailBlur = useCallback(() => {
    setTouched(true);
    setError(validateEmail(email));
  }, [email, validateEmail]);

  const onSubmit = useCallback(() => {
    setTouched(true);
    const emailError = validateEmail(email);
    setError(emailError);

    if (emailError) {
      return;
    }

    if (mutation.isPending) return;

    mutation.mutate(email);
  }, [email, mutation, validateEmail]);

  const onBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return {
    email,
    error,
    isLoading: mutation.isPending,
    isValid,
    isSuccess,
    onEmailChange,
    onEmailBlur,
    onSubmit,
    onBack,
  };
}
