import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { profileApi } from '../api/profileApi';
import { useGoBack } from '../../../hooks/useGoBack';
import { signupService } from '../../signup/services/signupService';

type PhoneVerificationMode = 'view' | 'input' | 'code';

const VERIFICATION_CODE_EXPIRY_SECONDS = 180;

export function useProfileEdit() {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [originalPhone, setOriginalPhone] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [gender, setGender] = useState<string | null>(null);
  const [isMarketingEmail, setIsMarketingEmail] = useState(false);
  const [isMarketingSms, setIsMarketingSms] = useState(false);
  
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [phoneVerificationMode, setPhoneVerificationMode] = useState<PhoneVerificationMode>('view');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationCodeError, setVerificationCodeError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const email = user?.email || '';

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await profileApi.fetchUserProfile();
        setName(profile.name || '');
        setPhone(profile.phone || '');
        setOriginalPhone(profile.phone || '');
        
        if (profile.birthDate) {
          const [year, month, day] = profile.birthDate.split('-');
          setBirthYear(year || '');
          setBirthMonth(month || '');
          setBirthDay(day || '');
        }
        
        setGender(profile.gender || null);
        setIsMarketingEmail(profile.isMarketingEmail ?? false);
        setIsMarketingSms(profile.isMarketingSms ?? false);
        
        setIsLoading(false);
      } catch {
        showToast('프로필 정보를 불러오는데 실패했습니다', 'error');
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [showToast]);

  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timer]);

  const startTimer = () => {
    setTimer(VERIFICATION_CODE_EXPIRY_SECONDS);
  };

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (nameError) setNameError(null);
  };

  const handlePhoneChange = (value: string) => {
    const formatted = value.replace(/[^0-9]/g, '');
    setPhone(formatted);
    if (phoneError) setPhoneError(null);
  };

  const handleBirthYearChange = (value: string) => {
    const formatted = value.replace(/[^0-9]/g, '').slice(0, 4);
    setBirthYear(formatted);
  };

  const handleBirthMonthChange = (value: string) => {
    const formatted = value.replace(/[^0-9]/g, '').slice(0, 2);
    setBirthMonth(formatted);
  };

  const handleBirthDayChange = (value: string) => {
    const formatted = value.replace(/[^0-9]/g, '').slice(0, 2);
    setBirthDay(formatted);
  };

  const handleGenderChange = (value: string | null) => {
    setGender(value);
  };

  const handleMarketingEmailChange = (value: boolean) => {
    setIsMarketingEmail(value);
  };

  const handleMarketingSmsChange = (value: boolean) => {
    setIsMarketingSms(value);
  };

  const validateForm = (): boolean => {
    let isValid = true;

    if (!name.trim()) {
      setNameError('성함을 입력해주세요');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let birthDate: string | null = null;
      if (birthYear && birthMonth && birthDay) {
        birthDate = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
      }

      const updateData = {
        name,
        phone: phone || undefined,
        birthDate,
        gender,
        isMarketingEmail,
        isMarketingSms,
      };

      const result = await profileApi.updateProfile(updateData);

      if (result.success) {
        setShowSuccessModal(true);
      } else {
        showToast(result.message || '프로필 수정에 실패했습니다', 'error');
      }
    } catch {
      showToast('프로필 수정 중 오류가 발생했습니다', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    goBack();
  };

  const handleWithdrawClick = () => {
    navigate('/profile/withdraw');
  };

  const handlePhoneVerifyClick = () => {
    setPhone('');
    setPhoneVerificationMode('input');
    setVerificationCode('');
    setVerificationCodeError(null);
    setPhoneError(null);
  };

  const handleCancelPhoneVerification = useCallback(() => {
    setPhone(originalPhone);
    setPhoneVerificationMode('view');
    setVerificationCode('');
    setVerificationCodeError(null);
    setPhoneError(null);
    setTimer(0);
  }, [originalPhone]);

  const handleSendPhoneCode = useCallback(async () => {
    if (!phone || phone.length < 10) {
      setPhoneError('휴대폰 번호를 정확히 입력해주세요');
      return;
    }

    setIsSendingCode(true);
    setPhoneError(null);

    try {
      const result = await signupService.sendPhoneVerificationCode(phone);
      if (result.success) {
        setPhoneVerificationMode('code');
        startTimer();
        showToast('인증번호가 발송되었습니다', 'success');
      } else {
        setPhoneError(result.message);
      }
    } catch {
      setPhoneError('인증번호 발송에 실패했습니다');
    } finally {
      setIsSendingCode(false);
    }
  }, [phone, showToast]);

  const handleResendCode = useCallback(async () => {
    setIsSendingCode(true);
    setVerificationCodeError(null);

    try {
      const result = await signupService.sendPhoneVerificationCode(phone);
      if (result.success) {
        startTimer();
        setVerificationCode('');
        showToast('인증번호가 재발송되었습니다', 'success');
      } else {
        setVerificationCodeError(result.message);
      }
    } catch {
      setVerificationCodeError('인증번호 발송에 실패했습니다');
    } finally {
      setIsSendingCode(false);
    }
  }, [phone, showToast]);

  const handleVerificationCodeChange = (value: string) => {
    const formatted = value.replace(/[^0-9]/g, '').slice(0, 6);
    setVerificationCode(formatted);
    if (verificationCodeError) setVerificationCodeError(null);
  };

  const handleVerifyCode = useCallback(async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setVerificationCodeError('인증번호 6자리를 입력해주세요');
      return;
    }

    if (timer === 0) {
      setVerificationCodeError('인증 시간이 만료되었습니다. 다시 시도해주세요');
      return;
    }

    setIsVerifyingCode(true);
    setVerificationCodeError(null);

    try {
      const result = await signupService.verifyPhoneCode(phone, verificationCode);
      if (result.success) {
        setOriginalPhone(phone);
        setPhoneVerificationMode('view');
        setVerificationCode('');
        setTimer(0);
        showToast('휴대폰 번호가 인증되었습니다', 'success');
      } else {
        setVerificationCodeError(result.message);
      }
    } catch {
      setVerificationCodeError('인증에 실패했습니다');
    } finally {
      setIsVerifyingCode(false);
    }
  }, [phone, verificationCode, timer, showToast]);

  const handleModalConfirm = () => {
    setShowSuccessModal(false);
    navigate('/profile', { replace: true });
  };

  return {
    email,
    name,
    phone,
    birthYear,
    birthMonth,
    birthDay,
    gender,
    isMarketingEmail,
    isMarketingSms,
    nameError,
    phoneError,
    isSubmitting,
    isLoading,
    showSuccessModal,
    phoneVerificationMode,
    verificationCode,
    verificationCodeError,
    timer,
    timerDisplay: formatTimer(timer),
    isSendingCode,
    isVerifyingCode,
    handleNameChange,
    handlePhoneChange,
    handleBirthYearChange,
    handleBirthMonthChange,
    handleBirthDayChange,
    handleGenderChange,
    handleMarketingEmailChange,
    handleMarketingSmsChange,
    handleSubmit,
    handleBack,
    handleModalConfirm,
    handleWithdrawClick,
    handlePhoneVerifyClick,
    handleCancelPhoneVerification,
    handleSendPhoneCode,
    handleResendCode,
    handleVerificationCodeChange,
    handleVerifyCode,
  };
}
