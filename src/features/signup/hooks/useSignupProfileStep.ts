import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useSignupFormState, clearFormDataFromStorage } from './useSignupFormState';
import { signupService } from '../services/signupService';

interface TouchedFields {
  name: boolean;
  phone: boolean;
  birthDate: boolean;
  gender: boolean;
  referralId: boolean;
}

export function useSignupProfileStep() {
  const navigate = useNavigate();
  const { formData, updateFormData } = useSignupFormState();

  const [touched, setTouched] = useState<TouchedFields>({
    name: false,
    phone: false,
    birthDate: false,
    gender: false,
    referralId: false,
  });

  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralModalMessage, setReferralModalMessage] = useState('');
  
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneModalMessage, setPhoneModalMessage] = useState('');
  const [isPhoneVerifySuccess, setIsPhoneVerifySuccess] = useState(false);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  
  const onCloseErrorModal = useCallback(() => setShowErrorModal(false), []);

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
    }),
    onSuccess: () => {
      clearFormDataFromStorage();
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
    if (!/^[0-9]{10,11}$/.test(value.replace(/-/g, ''))) {
      return '올바른 휴대폰 번호를 입력해주세요';
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

  const errors = {
    name: touched.name ? validateName(formData.name) : null,
    phone: touched.phone ? validatePhone(formData.phone) : null,
    birthDate: touched.birthDate ? validateBirthDate(formData.birthYear, formData.birthMonth, formData.birthDay) : null,
    gender: touched.gender ? validateGender(formData.gender) : null,
    referralId: touched.referralId ? validateReferralId(formData.referralId) : null,
  };

  const isNameValid = !validateName(formData.name);
  const isPhoneValid = !validatePhone(formData.phone);
  const isBirthDateValid = !validateBirthDate(formData.birthYear, formData.birthMonth, formData.birthDay);
  const isGenderValid = !validateGender(formData.gender);
  const isReferralIdValid = !validateReferralId(formData.referralId);
  const isAgreementValid = formData.isOver14 && formData.termsAgreed && formData.privacyAgreed;
  
  const isValid = isNameValid && isPhoneValid && formData.isPhoneVerified && isBirthDateValid && isGenderValid && isReferralIdValid && isAgreementValid;

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

  const onPhoneVerify = useCallback(() => {
    setTouched(prev => ({ ...prev, phone: true }));
    
    if (!isPhoneValid) {
      setPhoneModalMessage('올바른 휴대폰 번호를 입력해주세요');
      setIsPhoneVerifySuccess(false);
      setShowPhoneModal(true);
      return;
    }
    
    // Mock: 휴대폰 인증 성공 처리 (나중에 Solapi 연동 시 실제 인증으로 대체)
    updateFormData({ isPhoneVerified: true });
    setPhoneModalMessage('휴대폰 인증이 완료되었습니다');
    setIsPhoneVerifySuccess(true);
    setShowPhoneModal(true);
  }, [isPhoneValid, updateFormData]);
  
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

  const onSubmit = useCallback(() => {
    setTouched({ name: true, phone: true, birthDate: true, gender: true, referralId: true });

    if (!isValid || signupMutation.isPending) {
      return;
    }

    signupMutation.mutate();
  }, [isValid, signupMutation]);

  return {
    email: formData.email,
    name: formData.name,
    phone: formData.phone,
    isPhoneVerified: formData.isPhoneVerified,
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
    isAgreementValid,
    isValid,
    errors,
    showReferralModal,
    referralModalMessage,
    showPhoneModal,
    phoneModalMessage,
    isPhoneVerifySuccess,
    showErrorModal,
    errorModalMessage,
    onCloseErrorModal,
    onNameChange,
    onPhoneChange,
    onNameBlur,
    onPhoneBlur,
    onPhoneVerify,
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
    onOver14Change,
    onTermsAgreedChange,
    onPrivacyAgreedChange,
    onAllAgreeChange,
    onTermsDetailClick,
    onPrivacyDetailClick,
    onSubmit,
  };
}
