import { useState, useCallback } from 'react';
import { useSignupFormState } from './useSignupFormState';
import { SIGNUP_MESSAGES } from '../constants';

interface TouchedFields {
  password: boolean;
  passwordConfirm: boolean;
}

export function useSignupPasswordStep() {
  const { formData, updateFormData } = useSignupFormState();

  const [touched, setTouched] = useState<TouchedFields>({
    password: false,
    passwordConfirm: false,
  });

  const validatePassword = useCallback((value: string): string | null => {
    if (!value.trim()) {
      return SIGNUP_MESSAGES.REQUIRED;
    }
    if (value.length < 8) {
      return '비밀번호는 8자리 이상이어야 합니다';
    }
    return null;
  }, []);

  const validatePasswordConfirm = useCallback((value: string, password: string): string | null => {
    if (!value.trim()) {
      return SIGNUP_MESSAGES.REQUIRED;
    }
    if (value !== password) {
      return '비밀번호가 일치하지 않습니다';
    }
    return null;
  }, []);

  const errors = {
    password: touched.password ? validatePassword(formData.password) : null,
    passwordConfirm: touched.passwordConfirm ? validatePasswordConfirm(formData.passwordConfirm, formData.password) : null,
  };

  const isPasswordValid = !validatePassword(formData.password);
  const isPasswordConfirmValid = !validatePasswordConfirm(formData.passwordConfirm, formData.password);

  const onPasswordChange = useCallback((value: string) => {
    updateFormData({ password: value });
  }, [updateFormData]);

  const onPasswordConfirmChange = useCallback((value: string) => {
    updateFormData({ passwordConfirm: value });
  }, [updateFormData]);

  const onPasswordBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, password: true }));
  }, []);

  const onPasswordConfirmBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, passwordConfirm: true }));
  }, []);

  const onTogglePasswordVisibility = useCallback(() => {
    updateFormData({ showPassword: !formData.showPassword });
  }, [formData.showPassword, updateFormData]);

  const onTogglePasswordConfirmVisibility = useCallback(() => {
    updateFormData({ showPasswordConfirm: !formData.showPasswordConfirm });
  }, [formData.showPasswordConfirm, updateFormData]);

  const onPasswordNext = useCallback(() => {
    setTouched({ password: true, passwordConfirm: true });
    
    if (isPasswordValid && isPasswordConfirmValid) {
      updateFormData({ isPasswordSet: true });
    }
  }, [isPasswordValid, isPasswordConfirmValid, updateFormData]);

  return {
    email: formData.email,
    password: formData.password,
    passwordConfirm: formData.passwordConfirm,
    showPassword: formData.showPassword,
    showPasswordConfirm: formData.showPasswordConfirm,
    isPasswordSet: formData.isPasswordSet,
    isPasswordValid,
    isPasswordConfirmValid,
    errors,
    onPasswordChange,
    onPasswordConfirmChange,
    onPasswordBlur,
    onPasswordConfirmBlur,
    onTogglePasswordVisibility,
    onTogglePasswordConfirmVisibility,
    onPasswordNext,
  };
}
