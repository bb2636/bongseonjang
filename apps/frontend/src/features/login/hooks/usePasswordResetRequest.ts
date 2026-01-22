import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/contexts/ToastContext';
import { API_BASE_URL } from '@/shared/config/apiConfig';

type Step = 'email' | 'emailVerified' | 'codeSent' | 'codeVerified';

interface CheckEmailResponse {
  success: boolean;
  exists: boolean;
  isSocialOnlyAccount: boolean;
  provider: 'kakao' | 'naver' | null;
  message: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  expiresInSeconds?: number;
}

async function checkEmailApi(email: string): Promise<CheckEmailResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/password-reset/check-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return response.json();
}

async function sendCodeApi(email: string): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/password-reset/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return response.json();
}

async function verifyCodeApi(email: string, code: string): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/password-reset/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  return response.json();
}

async function changePasswordApi(
  email: string, 
  code: string, 
  newPassword: string,
  confirmPassword: string
): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/password-reset/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, newPassword, confirmPassword }),
  });
  return response.json();
}

const TIMER_SECONDS = 180;

export function usePasswordResetRequest() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [emailError, setEmailError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  const [socialProvider, setSocialProvider] = useState<'kakao' | 'naver' | null>(null);
  
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (timerSeconds > 0) {
      timerRef.current = setTimeout(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timerSeconds]);

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

  const validatePassword = useCallback((password: string, confirm: string): string | null => {
    if (!password) {
      return '새 비밀번호를 입력해주세요.';
    }
    if (password.length < 6) {
      return '비밀번호는 6자 이상이어야 합니다.';
    }
    if (!confirm) {
      return '비밀번호 확인을 입력해주세요.';
    }
    if (password !== confirm) {
      return '비밀번호가 일치하지 않습니다.';
    }
    return null;
  }, []);

  const onEmailChange = useCallback((value: string) => {
    setEmail(value);
    setEmailError(null);
    setSocialProvider(null);
    if (step !== 'email') {
      setStep('email');
      setCode('');
      setCodeError(null);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError(null);
      setTimerSeconds(0);
    }
  }, [step]);

  const onCodeChange = useCallback((value: string) => {
    setCode(value);
    setCodeError(null);
  }, []);

  const onNewPasswordChange = useCallback((value: string) => {
    setNewPassword(value);
    setPasswordError(null);
  }, []);

  const onConfirmPasswordChange = useCallback((value: string) => {
    setConfirmPassword(value);
    setPasswordError(null);
  }, []);

  const onCheckEmail = useCallback(async () => {
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }

    setIsCheckingEmail(true);
    setEmailError(null);
    setSocialProvider(null);

    try {
      const result = await checkEmailApi(email);
      
      if (!result.exists) {
        setEmailError('가입되지 않은 이메일입니다.');
        return;
      }

      if (result.isSocialOnlyAccount) {
        setSocialProvider(result.provider);
        return;
      }

      setStep('emailVerified');
    } catch {
      setEmailError('계정 확인에 실패했습니다.');
    } finally {
      setIsCheckingEmail(false);
    }
  }, [email, validateEmail]);

  const onSendCode = useCallback(async () => {
    if (step !== 'emailVerified' && step !== 'codeSent') return;

    setIsSendingCode(true);
    setCodeError(null);

    try {
      const result = await sendCodeApi(email);
      
      if (!result.success) {
        setCodeError(result.message);
        return;
      }

      setStep('codeSent');
      setTimerSeconds(TIMER_SECONDS);
      setCode('');
      showToast('작성하신 이메일로 인증코드를 보냈어요');
    } catch {
      setCodeError('인증코드 발송에 실패했습니다.');
    } finally {
      setIsSendingCode(false);
    }
  }, [email, step, showToast]);

  const onVerifyCode = useCallback(async () => {
    if (!code.trim()) {
      setCodeError('인증코드를 입력해주세요.');
      return;
    }

    setIsVerifyingCode(true);
    setCodeError(null);

    try {
      const result = await verifyCodeApi(email, code);
      
      if (!result.success) {
        setCodeError(result.message);
        return;
      }

      setStep('codeVerified');
      setTimerSeconds(0);
    } catch {
      setCodeError('인증코드 확인에 실패했습니다.');
    } finally {
      setIsVerifyingCode(false);
    }
  }, [email, code]);

  const resetToCodeStep = useCallback(() => {
    setStep('codeSent');
    setCode('');
    setCodeError(null);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    setTimerSeconds(0);
  }, []);

  const onChangePassword = useCallback(async () => {
    const error = validatePassword(newPassword, confirmPassword);
    if (error) {
      setPasswordError(error);
      return;
    }

    setIsChangingPassword(true);
    setPasswordError(null);

    try {
      const result = await changePasswordApi(email, code, newPassword, confirmPassword);
      
      if (!result.success) {
        const isSessionExpired = result.message.includes('만료') || result.message.includes('인증이 완료되지');
        
        if (isSessionExpired) {
          resetToCodeStep();
          showToast('인증이 만료되었습니다. 인증코드를 다시 받아주세요.');
          return;
        }
        
        setPasswordError(result.message);
        return;
      }

      setIsComplete(true);
      showToast('비밀번호가 성공적으로 변경되었습니다');
    } catch {
      setPasswordError('비밀번호 변경에 실패했습니다.');
    } finally {
      setIsChangingPassword(false);
    }
  }, [email, code, newPassword, confirmPassword, validatePassword, showToast, resetToCodeStep]);

  const onBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onGoToLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const formatTimer = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const isLoading = isCheckingEmail || isSendingCode || isVerifyingCode || isChangingPassword;
  const canSendCode = step === 'emailVerified' || step === 'codeSent';
  const canVerifyCode = step === 'codeSent' && code.trim().length > 0 && timerSeconds > 0;
  const canChangePassword = step === 'codeVerified' && newPassword && confirmPassword;

  return {
    step,
    email,
    code,
    newPassword,
    confirmPassword,
    emailError,
    codeError,
    passwordError,
    socialProvider,
    isLoading,
    isCheckingEmail,
    isSendingCode,
    isVerifyingCode,
    isChangingPassword,
    isComplete,
    timerSeconds,
    timerFormatted: formatTimer(timerSeconds),
    canSendCode,
    canVerifyCode,
    canChangePassword,
    onEmailChange,
    onCodeChange,
    onNewPasswordChange,
    onConfirmPasswordChange,
    onCheckEmail,
    onSendCode,
    onVerifyCode,
    onChangePassword,
    onBack,
    onGoToLogin,
  };
}
