import { useState, useCallback, useEffect, useRef } from 'react';
import { useSignupFormState } from './useSignupFormState';
import { SIGNUP_MESSAGES, SIGNUP_VALIDATION } from '../constants';
import { sendVerificationCode, verifyCode } from '../../../services/emailVerificationService';

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

  const [isVerifying, setIsVerifying] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const onVerifyEmail = useCallback(async () => {
    setTouched(prev => ({ ...prev, email: true }));
    
    if (!isEmailValid) {
      return;
    }

    setIsVerifying(true);
    try {
      await sendVerificationCode(formData.email);
      updateFormData({ isCodeSent: true });
      setTimer(TIMER_DURATION);
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    } catch (error) {
      console.error('Email verification failed:', error);
      alert(error instanceof Error ? error.message : '이메일 전송에 실패했습니다');
    } finally {
      setIsVerifying(false);
    }
  }, [formData.email, isEmailValid, updateFormData]);

  const onResendCode = useCallback(async () => {
    if (!isEmailValid) {
      return;
    }

    setIsVerifying(true);
    try {
      await sendVerificationCode(formData.email);
      setTimer(TIMER_DURATION);
      updateFormData({ verificationCode: '' });
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    } catch (error) {
      console.error('Resend code failed:', error);
      alert(error instanceof Error ? error.message : '이메일 전송에 실패했습니다');
    } finally {
      setIsVerifying(false);
    }
  }, [formData.email, isEmailValid, updateFormData]);

  const onConfirmCode = useCallback(async () => {
    setTouched(prev => ({ ...prev, verificationCode: true }));
    
    if (!isCodeValid) {
      return;
    }

    setIsConfirming(true);
    try {
      const result = await verifyCode(formData.email, formData.verificationCode);
      if (result.success) {
        updateFormData({ isEmailVerified: true });
      } else {
        setErrorModalMessage('이메일 인증코드가 틀립니다');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Code confirmation failed:', error);
      setErrorModalMessage('인증에 실패했습니다');
      setShowErrorModal(true);
    } finally {
      setIsConfirming(false);
    }
  }, [formData.email, formData.verificationCode, isCodeValid, updateFormData]);

  const onCloseErrorModal = useCallback(() => {
    setShowErrorModal(false);
    setErrorModalMessage('');
  }, []);

  return {
    email: formData.email,
    verificationCode: formData.verificationCode,
    isCodeSent: formData.isCodeSent,
    isEmailVerified: formData.isEmailVerified,
    isVerifying,
    isConfirming,
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
