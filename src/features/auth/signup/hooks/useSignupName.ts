import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SIGNUP_MESSAGES, SIGNUP_VALIDATION } from '../constants';
import { sendVerificationCode, verifyCode } from '../../../../services/emailVerificationService';

interface SignupEmailState {
  email: string;
  verificationCode: string;
  isCodeSent: boolean;
  isEmailVerified: boolean;
  password: string;
  passwordConfirm: string;
  showPassword: boolean;
  showPasswordConfirm: boolean;
}

interface SignupEmailErrors {
  email: string | null;
  verificationCode: string | null;
  password: string | null;
  passwordConfirm: string | null;
}

interface TouchedFields {
  email: boolean;
  verificationCode: boolean;
  password: boolean;
  passwordConfirm: boolean;
}

const TIMER_DURATION = 180;

export function useSignupEmail() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<SignupEmailState>({
    email: '',
    verificationCode: '',
    isCodeSent: false,
    isEmailVerified: false,
    password: '',
    passwordConfirm: '',
    showPassword: false,
    showPasswordConfirm: false,
  });
  
  const [touched, setTouched] = useState<TouchedFields>({
    email: false,
    verificationCode: false,
    password: false,
    passwordConfirm: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
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

  const errors: SignupEmailErrors = {
    email: touched.email ? validateEmail(formData.email) : null,
    verificationCode: touched.verificationCode ? validateCode(formData.verificationCode) : null,
    password: touched.password ? validatePassword(formData.password) : null,
    passwordConfirm: touched.passwordConfirm ? validatePasswordConfirm(formData.passwordConfirm, formData.password) : null,
  };

  const isEmailValid = !validateEmail(formData.email);
  const isCodeValid = !validateCode(formData.verificationCode);
  const isPasswordValid = !validatePassword(formData.password);
  const isPasswordConfirmValid = !validatePasswordConfirm(formData.passwordConfirm, formData.password);
  const isValid = isEmailValid && formData.isEmailVerified && isPasswordValid && isPasswordConfirmValid;

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

  const onPasswordChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, password: value }));
  }, []);

  const onPasswordConfirmChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, passwordConfirm: value }));
  }, []);

  const onPasswordBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, password: true }));
  }, []);

  const onPasswordConfirmBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, passwordConfirm: true }));
  }, []);

  const onTogglePasswordVisibility = useCallback(() => {
    setFormData(prev => ({ ...prev, showPassword: !prev.showPassword }));
  }, []);

  const onTogglePasswordConfirmVisibility = useCallback(() => {
    setFormData(prev => ({ ...prev, showPasswordConfirm: !prev.showPasswordConfirm }));
  }, []);

  const onVerifyEmail = useCallback(async () => {
    setTouched(prev => ({ ...prev, email: true }));
    
    if (!isEmailValid) {
      return;
    }

    setIsVerifying(true);
    try {
      await sendVerificationCode(formData.email);
      setFormData(prev => ({ ...prev, isCodeSent: true }));
      setTimer(TIMER_DURATION);
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    } catch (error) {
      console.error('Email verification failed:', error);
      alert(error instanceof Error ? error.message : '이메일 전송에 실패했습니다');
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
      await sendVerificationCode(formData.email);
      setTimer(TIMER_DURATION);
      setFormData(prev => ({ ...prev, verificationCode: '' }));
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
    } catch (error) {
      console.error('Resend code failed:', error);
      alert(error instanceof Error ? error.message : '이메일 전송에 실패했습니다');
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
      const result = await verifyCode(formData.email, formData.verificationCode);
      if (result.success) {
        setFormData(prev => ({ ...prev, isEmailVerified: true }));
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
  }, [formData.email, formData.verificationCode, isCodeValid]);

  const onCloseErrorModal = useCallback(() => {
    setShowErrorModal(false);
    setErrorModalMessage('');
  }, []);

  const onSubmit = useCallback(async () => {
    setTouched({ email: true, verificationCode: true, password: true, passwordConfirm: true });

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
      password: formData.password,
      passwordConfirm: formData.passwordConfirm,
      showPassword: formData.showPassword,
      showPasswordConfirm: formData.showPasswordConfirm,
      isLoading,
      isVerifying,
      isConfirming,
      isEmailValid,
      isCodeValid,
      isPasswordValid,
      isPasswordConfirmValid,
      isValid,
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
      onPasswordChange,
      onPasswordConfirmChange,
      onPasswordBlur,
      onPasswordConfirmBlur,
      onTogglePasswordVisibility,
      onTogglePasswordConfirmVisibility,
      onVerifyEmail,
      onResendCode,
      onConfirmCode,
      onCloseErrorModal,
      onSubmit,
      onBack,
    },
  };
}
