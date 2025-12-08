import { useState, useCallback, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSignupFormState } from './useSignupFormState';
import { SIGNUP_MESSAGES, SIGNUP_VALIDATION } from '../constants';
import { signupService } from '../services/signupService';

const TIMER_DURATION = 180;

interface TouchedFields {
  email: boolean;
  verificationCode: boolean;
}

export function useSignupEmailStep() {
  const { formData, updateFormData } = useSignupFormState();

  const [touched, setTouched] = useState<TouchedFields>({
    email: false,
    verificationCode: false,
  });

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const sendCodeMutation = useMutation({
    mutationFn: (email: string) => signupService.sendVerificationCode(email),
    onSuccess: () => {
      updateFormData({ isCodeSent: true });
      setTimer(TIMER_DURATION);
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    },
    onError: (error: Error) => {
      alert(error.message || '이메일 전송에 실패했습니다');
    },
  });

  const verifyCodeMutation = useMutation({
    mutationFn: (data: { email: string; code: string }) => signupService.verifyCode(data.email, data.code),
    onSuccess: (result) => {
      if (result.success) {
        updateFormData({ isEmailVerified: true });
      } else {
        setErrorModalMessage('이메일 인증코드가 틀립니다');
        setShowErrorModal(true);
      }
    },
    onError: () => {
      setErrorModalMessage('인증에 실패했습니다');
      setShowErrorModal(true);
    },
  });

  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timer]);

  const formatTimer = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

  const validateEmail = useCallback((value: string): string | null => {
    if (!value.trim()) {
      return SIGNUP_MESSAGES.REQUIRED;
    }
    if (!SIGNUP_VALIDATION.EMAIL_REGEX.test(value)) {
      return SIGNUP_MESSAGES.EMAIL_INVALID;
    }
    return null;
  }, []);

  const validateCode = useCallback((value: string): string | null => {
    if (!value.trim()) {
      return SIGNUP_MESSAGES.REQUIRED;
    }
    if (value.length !== 6) {
      return '인증코드는 6자리입니다';
    }
    return null;
  }, []);

  const errors = {
    email: touched.email ? validateEmail(formData.email) : null,
    verificationCode: touched.verificationCode ? validateCode(formData.verificationCode) : null,
  };

  const isEmailValid = !validateEmail(formData.email);
  const isCodeValid = !validateCode(formData.verificationCode);

  const onEmailChange = useCallback((value: string) => {
    updateFormData({ 
      email: value, 
      isCodeSent: false,
      isEmailVerified: false,
      verificationCode: '',
    });
    setTimer(0);
  }, [updateFormData]);

  const onCodeChange = useCallback((value: string) => {
    if (value.length <= 6) {
      updateFormData({ verificationCode: value });
    }
  }, [updateFormData]);

  const onEmailBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, email: true }));
  }, []);

  const onCodeBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, verificationCode: true }));
  }, []);

  const onVerifyEmail = useCallback(() => {
    setTouched(prev => ({ ...prev, email: true }));
    
    if (!isEmailValid || sendCodeMutation.isPending) {
      return;
    }

    sendCodeMutation.mutate(formData.email);
  }, [formData.email, isEmailValid, sendCodeMutation]);

  const onResendCode = useCallback(() => {
    if (!isEmailValid || sendCodeMutation.isPending) {
      return;
    }

    updateFormData({ verificationCode: '' });
    sendCodeMutation.mutate(formData.email);
  }, [formData.email, isEmailValid, sendCodeMutation, updateFormData]);

  const onConfirmCode = useCallback(() => {
    setTouched(prev => ({ ...prev, verificationCode: true }));
    
    if (!isCodeValid || verifyCodeMutation.isPending) {
      return;
    }

    verifyCodeMutation.mutate({ email: formData.email, code: formData.verificationCode });
  }, [formData.email, formData.verificationCode, isCodeValid, verifyCodeMutation]);

  const onCloseErrorModal = useCallback(() => {
    setShowErrorModal(false);
    setErrorModalMessage('');
  }, []);

  return {
    email: formData.email,
    verificationCode: formData.verificationCode,
    isCodeSent: formData.isCodeSent,
    isEmailVerified: formData.isEmailVerified,
    isVerifying: sendCodeMutation.isPending,
    isConfirming: verifyCodeMutation.isPending,
    isEmailValid,
    isCodeValid,
    errors,
    showSnackbar,
    showErrorModal,
    errorModalMessage,
    timer: formatTimer(timer),
    isTimerActive: timer > 0,
    onEmailChange,
    onCodeChange,
    onEmailBlur,
    onCodeBlur,
    onVerifyEmail,
    onResendCode,
    onConfirmCode,
    onCloseErrorModal,
  };
}
