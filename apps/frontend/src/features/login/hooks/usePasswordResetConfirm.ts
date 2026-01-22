import { useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useGoBack } from '../../../hooks/useGoBack';
import { LOGIN_ROUTES } from '../constants';
import { API_BASE_URL } from '@/shared/config/apiConfig';

interface PasswordResetConfirmResponse {
  success: boolean;
  message: string;
}

async function confirmPasswordReset(data: { token: string; newPassword: string }): Promise<PasswordResetConfirmResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/password-reset/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.message || '비밀번호 변경에 실패했습니다');
  }
  
  return result;
}

interface FieldError {
  newPassword: string | null;
  confirmPassword: string | null;
}

export function usePasswordResetConfirm() {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldError>({ newPassword: null, confirmPassword: null });
  const [touched, setTouched] = useState({ newPassword: false, confirmPassword: false });

  const mutation = useMutation({
    mutationFn: confirmPasswordReset,
    onSuccess: () => {
      navigate(LOGIN_ROUTES.EMAIL_LOGIN, { replace: true });
    },
    onError: (err: Error) => {
      setErrors(prev => ({ ...prev, newPassword: err.message }));
    },
  });

  const validateNewPassword = useCallback((value: string): string | null => {
    if (!value) {
      return '새 비밀번호를 입력해주세요.';
    }
    if (value.length < 6) {
      return '비밀번호는 6자 이상이어야 합니다.';
    }
    return null;
  }, []);

  const validateConfirmPassword = useCallback((value: string, password: string): string | null => {
    if (!value) {
      return '비밀번호 확인을 입력해주세요.';
    }
    if (value !== password) {
      return '비밀번호가 일치하지 않습니다.';
    }
    return null;
  }, []);

  const isValid = useMemo(() => {
    return !validateNewPassword(newPassword) && !validateConfirmPassword(confirmPassword, newPassword);
  }, [newPassword, confirmPassword, validateNewPassword, validateConfirmPassword]);

  const onNewPasswordChange = useCallback((value: string) => {
    setNewPassword(value);
    if (touched.newPassword) {
      setErrors(prev => ({ ...prev, newPassword: validateNewPassword(value) }));
    }
    if (touched.confirmPassword && confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(confirmPassword, value) }));
    }
  }, [touched, validateNewPassword, validateConfirmPassword, confirmPassword]);

  const onConfirmPasswordChange = useCallback((value: string) => {
    setConfirmPassword(value);
    if (touched.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(value, newPassword) }));
    }
  }, [touched.confirmPassword, validateConfirmPassword, newPassword]);

  const onNewPasswordBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, newPassword: true }));
    setErrors(prev => ({ ...prev, newPassword: validateNewPassword(newPassword) }));
  }, [newPassword, validateNewPassword]);

  const onConfirmPasswordBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, confirmPassword: true }));
    setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(confirmPassword, newPassword) }));
  }, [confirmPassword, newPassword, validateConfirmPassword]);

  const onSubmit = useCallback(() => {
    setTouched({ newPassword: true, confirmPassword: true });

    const newPasswordError = validateNewPassword(newPassword);
    const confirmPasswordError = validateConfirmPassword(confirmPassword, newPassword);

    setErrors({ newPassword: newPasswordError, confirmPassword: confirmPasswordError });

    if (newPasswordError || confirmPasswordError) {
      return;
    }

    if (!token) {
      setErrors(prev => ({ ...prev, newPassword: '유효하지 않은 토큰입니다' }));
      return;
    }

    if (mutation.isPending) return;

    mutation.mutate({ token, newPassword });
  }, [newPassword, confirmPassword, token, mutation, validateNewPassword, validateConfirmPassword]);

  const onBack = useCallback(() => {
    goBack();
  }, [goBack]);

  return {
    newPassword,
    confirmPassword,
    errors,
    isLoading: mutation.isPending,
    isValid,
    hasToken: !!token,
    onNewPasswordChange,
    onConfirmPasswordChange,
    onNewPasswordBlur,
    onConfirmPasswordBlur,
    onSubmit,
    onBack,
  };
}
