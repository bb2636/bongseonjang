import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useSignupFormState, clearFormDataFromStorage } from './useSignupFormState';
import { signupService } from '../services/signupService';
import { useAuth } from '@/contexts/AuthContext';

const PHONE_CODE_EXPIRY_SECONDS = 180;

interface TouchedFields {
  name: boolean;
  phone: boolean;
  birthDate: boolean;
  gender: boolean;
  referralId: boolean;
  addressName: boolean;
  address: boolean;
}

export function useSignupProfileStep() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const { formData, updateFormData } = useSignupFormState();

  const [touched, setTouched] = useState<TouchedFields>({
    name: false,
    phone: false,
    birthDate: false,
    gender: false,
    referralId: false,
    addressName: false,
    address: false,
  });

  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralModalMessage, setReferralModalMessage] = useState('');
  
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneModalMessage, setPhoneModalMessage] = useState('');
  const [isPhoneVerifySuccess, setIsPhoneVerifySuccess] = useState(false);

  const [phoneVerificationCode, setPhoneVerificationCode] = useState('');
  const [phoneCodeTimer, setPhoneCodeTimer] = useState(0);
  const [isPhoneCodeSent, setIsPhoneCodeSent] = useState(false);
  const [isPhoneCodeSending, setIsPhoneCodeSending] = useState(false);
  const [isPhoneCodeVerifying, setIsPhoneCodeVerifying] = useState(false);
  const [timerTrigger, setTimerTrigger] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  
  const onCloseErrorModal = useCallback(() => setShowErrorModal(false), []);

  useEffect(() => {
    if (timerTrigger === 0) {
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    timerRef.current = setInterval(() => {
      setPhoneCodeTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerTrigger]);

  const referralMutation = useMutation({
    mutationFn: (referralId: string) => signupService.verifyReferralId(referralId),
    onSuccess: (result) => {
      if (result.exists) {
        updateFormData({ isReferralIdVerified: true });
        setReferralModalMessage('추천인 아이디가 확인되었습니다');
      } else {
        updateFormData({ isReferralIdVerified: false });
        setReferralModalMessage('입력하신 아이디를 확인해주세요');
      }
      setShowReferralModal(true);
    },
    onError: () => {
      setReferralModalMessage('추천인 확인에 실패했습니다');
      setShowReferralModal(true);
      updateFormData({ isReferralIdVerified: false });
    },
  });

  const isSocialSignup = !!formData.socialProvider;

  const signupMutation = useMutation({
    mutationFn: () => signupService.signup({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phone: formData.phone,
      birthYear: formData.birthYear,
      birthMonth: formData.birthMonth,
      birthDay: formData.birthDay,
      gender: formData.gender,
      referralId: formData.referralId || undefined,
      addressName: formData.addressName,
      zonecode: formData.zonecode,
      address: formData.address,
      addressDetail: formData.addressDetail,
    }),
    onSuccess: (result) => {
      clearFormDataFromStorage();
      
      if (result.token && result.user) {
        loginWithToken(result.token, {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        });
      }
      
      navigate('/signup/complete');
    },
    onError: (error: Error) => {
      console.error('Signup failed:', error);
      const message = error.message || '회원가입에 실패했습니다. 다시 시도해주세요.';
      setErrorModalMessage(message);
      setShowErrorModal(true);
    },
  });

  const validateName = useCallback((value: string): string | null => {
    if (!value.trim()) {
      return '성함을 입력해주세요';
    }
    return null;
  }, []);

  const validatePhone = useCallback((value: string): string | null => {
    if (!value.trim()) {
      return '휴대폰 번호를 입력해주세요';
    }
    if (!/^[0-9]{11}$/.test(value.replace(/-/g, ''))) {
      return '휴대폰 번호 11자리를 입력해주세요';
    }
    return null;
  }, []);

  const validateBirthDate = useCallback((year: string, month: string, day: string): string | null => {
    if (!year.trim() || !month.trim() || !day.trim()) {
      return '생년월일을 입력해주세요';
    }
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    const dayNum = parseInt(day, 10);
    const currentYear = new Date().getFullYear();
    if (yearNum < 1900 || yearNum > currentYear) {
      return '올바른 연도를 입력해주세요';
    }
    if (monthNum < 1 || monthNum > 12) {
      return '올바른 월을 입력해주세요';
    }
    if (dayNum < 1 || dayNum > 31) {
      return '올바른 일을 입력해주세요';
    }
    return null;
  }, []);

  const validateGender = useCallback((value: string): string | null => {
    if (!value) {
      return '성별을 선택해주세요';
    }
    return null;
  }, []);

  const validateReferralId = useCallback((value: string): string | null => {
    if (value.trim() && value.length < 3) {
      return '최소 3자 이상 입력해주세요';
    }
    return null;
  }, []);

  const validateAddressName = useCallback((value: string): string | null => {
    if (!value.trim()) {
      return '배송지 이름을 입력해주세요';
    }
    return null;
  }, []);

  const validateAddress = useCallback((zonecode: string, address: string, addressDetail: string): string | null => {
    if (!zonecode.trim() || !address.trim()) {
      return '주소를 검색해주세요';
    }
    if (!addressDetail.trim()) {
      return '상세주소를 입력해주세요';
    }
    return null;
  }, []);

  const errors = {
    name: touched.name ? validateName(formData.name) : null,
    phone: touched.phone ? validatePhone(formData.phone) : null,
    birthDate: touched.birthDate ? validateBirthDate(formData.birthYear, formData.birthMonth, formData.birthDay) : null,
    gender: touched.gender ? validateGender(formData.gender) : null,
    referralId: touched.referralId ? validateReferralId(formData.referralId) : null,
    addressName: touched.addressName ? validateAddressName(formData.addressName) : null,
    address: touched.address ? validateAddress(formData.zonecode, formData.address, formData.addressDetail) : null,
  };

  const isNameValid = !validateName(formData.name);
  const isPhoneValid = !validatePhone(formData.phone);
  const isBirthDateValid = !validateBirthDate(formData.birthYear, formData.birthMonth, formData.birthDay);
  const isGenderValid = !validateGender(formData.gender);
  const isReferralIdValid = !validateReferralId(formData.referralId);
  const isAddressNameValid = !validateAddressName(formData.addressName);
  const isAddressValid = !validateAddress(formData.zonecode, formData.address, formData.addressDetail);
  const isAgreementValid = formData.isOver14 && formData.termsAgreed && formData.privacyAgreed;
  
  const isValid = isNameValid && isPhoneValid && formData.isPhoneVerified && isBirthDateValid && isGenderValid && isReferralIdValid && isAddressNameValid && isAddressValid && isAgreementValid;

  const onNameChange = useCallback((value: string) => {
    updateFormData({ name: value });
  }, [updateFormData]);

  const onPhoneChange = useCallback((value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '');
    updateFormData({ phone: numbersOnly });
  }, [updateFormData]);

  const onNameBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, name: true }));
  }, []);

  const onPhoneBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, phone: true }));
  }, []);

  const onSendPhoneCode = useCallback(async () => {
    setTouched(prev => ({ ...prev, phone: true }));
    
    if (!isPhoneValid) {
      setPhoneModalMessage('휴대폰 번호 11자리를 입력해주세요');
      setIsPhoneVerifySuccess(false);
      setShowPhoneModal(true);
      return;
    }
    
    setIsPhoneCodeSending(true);
    
    try {
      const result = await signupService.sendPhoneVerificationCode(formData.phone);
      
      if (result.success) {
        setIsPhoneCodeSent(true);
        setPhoneCodeTimer(PHONE_CODE_EXPIRY_SECONDS);
        setTimerTrigger((prev) => prev + 1);
        setPhoneVerificationCode('');
        setPhoneModalMessage('인증번호가 발송되었습니다');
        setIsPhoneVerifySuccess(true);
        setShowPhoneModal(true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '인증번호 발송에 실패했습니다';
      setPhoneModalMessage(message);
      setIsPhoneVerifySuccess(false);
      setShowPhoneModal(true);
    } finally {
      setIsPhoneCodeSending(false);
    }
  }, [isPhoneValid, formData.phone]);

  const onVerifyPhoneCode = useCallback(async () => {
    if (!phoneVerificationCode.trim()) {
      setPhoneModalMessage('인증번호를 입력해주세요');
      setIsPhoneVerifySuccess(false);
      setShowPhoneModal(true);
      return;
    }
    
    if (phoneCodeTimer <= 0) {
      setPhoneModalMessage('인증번호가 만료되었습니다. 다시 요청해주세요');
      setIsPhoneVerifySuccess(false);
      setShowPhoneModal(true);
      return;
    }
    
    setIsPhoneCodeVerifying(true);
    
    try {
      const result = await signupService.verifyPhoneCode(formData.phone, phoneVerificationCode);
      
      if (result.success) {
        updateFormData({ isPhoneVerified: true });
        setPhoneCodeTimer(0);
        setPhoneModalMessage('휴대폰 인증이 완료되었습니다');
        setIsPhoneVerifySuccess(true);
        setShowPhoneModal(true);
      } else {
        setPhoneModalMessage(result.message);
        setIsPhoneVerifySuccess(false);
        setShowPhoneModal(true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '인증에 실패했습니다';
      setPhoneModalMessage(message);
      setIsPhoneVerifySuccess(false);
      setShowPhoneModal(true);
    } finally {
      setIsPhoneCodeVerifying(false);
    }
  }, [phoneVerificationCode, phoneCodeTimer, formData.phone, updateFormData]);

  const onPhoneVerificationCodeChange = useCallback((value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 6);
    setPhoneVerificationCode(numbersOnly);
  }, []);

  const onPhoneVerify = useCallback(() => {
    onSendPhoneCode();
  }, [onSendPhoneCode]);
  
  const onClosePhoneModal = useCallback(() => {
    setShowPhoneModal(false);
    setPhoneModalMessage('');
  }, []);

  const onBirthYearChange = useCallback((value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 4);
    updateFormData({ birthYear: numbersOnly });
  }, [updateFormData]);

  const onBirthMonthChange = useCallback((value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 2);
    updateFormData({ birthMonth: numbersOnly });
  }, [updateFormData]);

  const onBirthDayChange = useCallback((value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 2);
    updateFormData({ birthDay: numbersOnly });
  }, [updateFormData]);

  const onBirthDateBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, birthDate: true }));
  }, []);

  const onGenderChange = useCallback((value: 'male' | 'female') => {
    updateFormData({ gender: value });
    setTouched(prev => ({ ...prev, gender: true }));
  }, [updateFormData]);

  const onReferralIdChange = useCallback((value: string) => {
    updateFormData({ referralId: value, isReferralIdVerified: false });
  }, [updateFormData]);

  const onReferralIdBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, referralId: true }));
  }, []);

  const onReferralIdVerify = useCallback(() => {
    setTouched(prev => ({ ...prev, referralId: true }));
    
    if (formData.referralId.length < 3) {
      setReferralModalMessage('최소 3자 이상 입력해주세요');
      setShowReferralModal(true);
      return;
    }

    if (referralMutation.isPending) return;

    referralMutation.mutate(formData.referralId);
  }, [formData.referralId, referralMutation]);

  const onCloseReferralModal = useCallback(() => {
    setShowReferralModal(false);
    setReferralModalMessage('');
  }, []);

  const onAddressSearchResult = useCallback((postalCode: string, address: string) => {
    updateFormData({
      zonecode: postalCode,
      address: address,
    });
    setTouched(prev => ({ ...prev, address: true }));
  }, [updateFormData]);

  const onAddressSearchError = useCallback((message: string) => {
    setErrorModalMessage(message);
    setShowErrorModal(true);
  }, []);

  const onAddressDetailChange = useCallback((value: string) => {
    updateFormData({ addressDetail: value });
  }, [updateFormData]);

  const onAddressNameChange = useCallback((value: string) => {
    updateFormData({ addressName: value });
    setTouched(prev => ({ ...prev, addressName: true }));
  }, [updateFormData]);

  const onAddressNameBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, addressName: true }));
  }, []);

  const onOver14Change = useCallback((value: boolean) => {
    updateFormData({ isOver14: value });
  }, [updateFormData]);

  const onTermsAgreedChange = useCallback((value: boolean) => {
    updateFormData({ termsAgreed: value });
  }, [updateFormData]);

  const onPrivacyAgreedChange = useCallback((value: boolean) => {
    updateFormData({ privacyAgreed: value });
  }, [updateFormData]);

  const onAllAgreeChange = useCallback((value: boolean) => {
    updateFormData({
      isOver14: value,
      termsAgreed: value,
      privacyAgreed: value,
    });
  }, [updateFormData]);

  const onTermsDetailClick = useCallback(() => {
    navigate('/signup/terms');
  }, [navigate]);

  const onPrivacyDetailClick = useCallback(() => {
    navigate('/signup/privacy');
  }, [navigate]);

  const onAddressDetailBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, address: true }));
  }, []);

  const onSubmit = useCallback(() => {
    setTouched({ name: true, phone: true, birthDate: true, gender: true, referralId: true, addressName: true, address: true });

    if (!isValid || signupMutation.isPending) {
      return;
    }

    if (isSocialSignup) {
      const birthDate = formData.birthYear && formData.birthMonth && formData.birthDay
        ? `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`
        : undefined;
      
      sessionStorage.setItem('pendingSocialProfileData', JSON.stringify({
        name: formData.name,
        phone: formData.phone || undefined,
        birthDate,
        gender: formData.gender || undefined,
        referralId: formData.referralId || undefined,
        addressName: formData.addressName || undefined,
        zonecode: formData.zonecode || undefined,
        address: formData.address || undefined,
        addressDetail: formData.addressDetail || undefined,
      }));
      
      clearFormDataFromStorage();
      navigate('/signup/complete');
      return;
    }

    signupMutation.mutate();
  }, [isValid, signupMutation, isSocialSignup, navigate]);

  return {
    email: formData.email,
    name: formData.name,
    phone: formData.phone,
    isPhoneVerified: formData.isPhoneVerified,
    isSocialSignup,
    socialProvider: formData.socialProvider,
    addressName: formData.addressName,
    zonecode: formData.zonecode,
    address: formData.address,
    addressDetail: formData.addressDetail,
    birthYear: formData.birthYear,
    birthMonth: formData.birthMonth,
    birthDay: formData.birthDay,
    gender: formData.gender,
    referralId: formData.referralId,
    isReferralIdVerified: formData.isReferralIdVerified,
    isOver14: formData.isOver14,
    termsAgreed: formData.termsAgreed,
    privacyAgreed: formData.privacyAgreed,
    isLoading: signupMutation.isPending,
    isReferralVerifying: referralMutation.isPending,
    isNameValid,
    isPhoneValid,
    isBirthDateValid,
    isGenderValid,
    isReferralIdValid,
    isAddressNameValid,
    isAddressValid,
    isAgreementValid,
    isValid,
    errors,
    showReferralModal,
    referralModalMessage,
    showPhoneModal,
    phoneModalMessage,
    isPhoneVerifySuccess,
    phoneVerificationCode,
    phoneCodeTimer,
    isPhoneCodeSent,
    isPhoneCodeSending,
    isPhoneCodeVerifying,
    showErrorModal,
    errorModalMessage,
    onCloseErrorModal,
    onNameChange,
    onPhoneChange,
    onNameBlur,
    onPhoneBlur,
    onPhoneVerify,
    onSendPhoneCode,
    onVerifyPhoneCode,
    onPhoneVerificationCodeChange,
    onBirthYearChange,
    onBirthMonthChange,
    onBirthDayChange,
    onBirthDateBlur,
    onGenderChange,
    onReferralIdChange,
    onReferralIdBlur,
    onReferralIdVerify,
    onCloseReferralModal,
    onClosePhoneModal,
    onAddressSearchResult,
    onAddressSearchError,
    onAddressDetailChange,
    onAddressDetailBlur,
    onAddressNameChange,
    onAddressNameBlur,
    onOver14Change,
    onTermsAgreedChange,
    onPrivacyAgreedChange,
    onAllAgreeChange,
    onTermsDetailClick,
    onPrivacyDetailClick,
    onSubmit,
  };
}
