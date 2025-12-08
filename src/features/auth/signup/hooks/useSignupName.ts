import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SIGNUP_MESSAGES, SIGNUP_VALIDATION } from '../constants';

interface SignupEmailState {
  email: string;
  verificationCode: string;
  isCodeSent: boolean;
  isEmailVerified: boolean;
}

interface SignupEmailErrors {
  email: string | null;
  verificationCode: string | null;
}

interface TouchedFields {
  email: boolean;
  verificationCode: boolean;
}

const TIMER_DURATION = 180;

export function useSignupEmail() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<SignupEmailState>({
    email: '',
    verificationCode: '',
    isCodeSent: false,
    isEmailVerified: false,
  });
  
  const [touched, setTouched] = useState<TouchedFields>({
    email: false,
    verificationCode: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
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

  const errors: SignupEmailErrors = {
    email: touched.email ? validateEmail(formData.email) : null,
    verificationCode: touched.verificationCode ? validateCode(formData.verificationCode) : null,
  };

  const isEmailValid = !validateEmail(formData.email);
  const isCodeValid = !validateCode(formData.verificationCode);
  const isValid = isEmailValid && formData.isEmailVerified;

  const onEmailChange = useCallback((value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      email: value, 
      isCodeSent: false,
      isEmailVerified: false,
      verificationCode: '',
    }));
    setTimer(0);
  }, []);

  const onCodeChange = useCallback((value: string) => {
    if (value.length <= 6) {
      setFormData(prev => ({ ...prev, verificationCode: value }));
    }
  }, []);

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
      console.log('Send verification code to:', formData.email);
      setFormData(prev => ({ ...prev, isCodeSent: true }));
      setTimer(TIMER_DURATION);
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    } catch (error) {
      console.error('Email verification failed:', error);
    } finally {
      setIsVerifying(false);
    }
  }, [formData.email, isEmailValid]);

  const onResendCode = useCallback(async () => {
    if (!isEmailValid) {
      return;
    }

    setIsVerifying(true);
    try {
      console.log('Resend verification code to:', formData.email);
      setTimer(TIMER_DURATION);
      setFormData(prev => ({ ...prev, verificationCode: '' }));
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    } catch (error) {
      console.error('Resend code failed:', error);
    } finally {
      setIsVerifying(false);
    }
  }, [formData.email, isEmailValid]);

  const onConfirmCode = useCallback(async () => {
    setTouched(prev => ({ ...prev, verificationCode: true }));
    
    if (!isCodeValid) {
      return;
    }

    setIsConfirming(true);
    try {
      console.log('Confirm code:', formData.verificationCode);
      setFormData(prev => ({ ...prev, isEmailVerified: true }));
    } catch (error) {
      console.error('Code confirmation failed:', error);
    } finally {
      setIsConfirming(false);
    }
  }, [formData.verificationCode, isCodeValid]);

  const onSubmit = useCallback(async () => {
    setTouched({ email: true, verificationCode: true });

    if (!isValid) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('Signup email:', formData);
    } catch (error) {
      console.error('Signup failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formData, isValid]);

  const onBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return {
    signupEmail: {
      email: formData.email,
      verificationCode: formData.verificationCode,
      isCodeSent: formData.isCodeSent,
      isEmailVerified: formData.isEmailVerified,
      isLoading,
      isVerifying,
      isConfirming,
      isEmailValid,
      isCodeValid,
      isValid,
      errors,
      showSnackbar,
      timer: formatTimer(timer),
      isTimerActive: timer > 0,
      onEmailChange,
      onCodeChange,
      onEmailBlur,
      onCodeBlur,
      onVerifyEmail,
      onResendCode,
      onConfirmCode,
      onSubmit,
      onBack,
    },
  };
}
