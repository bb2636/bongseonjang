import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSignupFormState } from './useSignupFormState';
import { SIGNUP_MESSAGES, SIGNUP_VALIDATION } from '../constants';
import { signupService } from '../services/signupService';

interface TouchedFields {
  email: boolean;
}

export function useSignupEmailStep() {
  const { formData, updateFormData } = useSignupFormState();

  const [touched, setTouched] = useState<TouchedFields>({
    email: false,
  });

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');

  const checkEmailMutation = useMutation({
    mutationFn: (email: string) => signupService.checkEmail(email),
  });

  const validateEmail = useCallback((value: string): string | null => {
    if (!value.trim()) {
      return SIGNUP_MESSAGES.REQUIRED;
    }
    if (!SIGNUP_VALIDATION.EMAIL_REGEX.test(value)) {
      return SIGNUP_MESSAGES.EMAIL_INVALID;
    }
    return null;
  }, []);

  const errors = {
    email: touched.email ? validateEmail(formData.email) : null,
  };

  const isEmailValid = !validateEmail(formData.email);

  const onEmailChange = useCallback((value: string) => {
    updateFormData({
      email: value,
      isEmailVerified: false,
    });
  }, [updateFormData]);

  const onEmailBlur = useCallback(() => {
    setTouched({ email: true });
  }, []);

  const onNext = useCallback(async () => {
    setTouched({ email: true });

    if (!isEmailValid || checkEmailMutation.isPending) {
      return;
    }

    try {
      const result = await checkEmailMutation.mutateAsync(formData.email);

      if (result.exists) {
        setErrorModalMessage('이미 가입된 이메일입니다');
        setShowErrorModal(true);
        return;
      }

      updateFormData({ isEmailVerified: true });
    } catch {
      setErrorModalMessage('이메일 확인에 실패했습니다');
      setShowErrorModal(true);
    }
  }, [formData.email, isEmailValid, checkEmailMutation, updateFormData]);

  const onCloseErrorModal = useCallback(() => {
    setShowErrorModal(false);
    setErrorModalMessage('');
  }, []);

  return {
    email: formData.email,
    isEmailValid,
    isChecking: checkEmailMutation.isPending,
    errors,
    showErrorModal,
    errorModalMessage,
    onEmailChange,
    onEmailBlur,
    onNext,
    onCloseErrorModal,
  };
}
