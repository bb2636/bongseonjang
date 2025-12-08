import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignupFormState, clearFormDataFromStorage } from './useSignupFormState';
import { verifyReferralId } from '../../../services/referralService';

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

  const [isLoading, setIsLoading] = useState(false);
  const [isReferralVerifying, setIsReferralVerifying] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralModalMessage, setReferralModalMessage] = useState('');

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
  
  const isValid = isNameValid && isPhoneValid && isBirthDateValid && isGenderValid && isReferralIdValid && isAgreementValid;

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
    if (isPhoneValid) {
      updateFormData({ isPhoneVerified: true });
    }
  }, [isPhoneValid, updateFormData]);

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

  const onReferralIdVerify = useCallback(async () => {
    setTouched(prev => ({ ...prev, referralId: true }));
    
    if (formData.referralId.length < 3) {
      setReferralModalMessage('최소 3자 이상 입력해주세요');
      setShowReferralModal(true);
      return;
    }

    setIsReferralVerifying(true);
    try {
      const result = await verifyReferralId(formData.referralId);
      if (result.exists) {
        updateFormData({ isReferralIdVerified: true });
        setReferralModalMessage('추천인 아이디가 확인되었습니다');
        setShowReferralModal(true);
      } else {
        updateFormData({ isReferralIdVerified: false });
        setReferralModalMessage('입력하신 아이디를 확인해주세요');
        setShowReferralModal(true);
      }
    } catch (error) {
      setReferralModalMessage('추천인 확인에 실패했습니다');
      setShowReferralModal(true);
      updateFormData({ isReferralIdVerified: false });
    } finally {
      setIsReferralVerifying(false);
    }
  }, [formData.referralId, updateFormData]);

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

  const onSubmit = useCallback(async () => {
    setTouched({ name: true, phone: true, birthDate: true, gender: true, referralId: true });

    if (!isValid) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('Signup data:', formData);
      clearFormDataFromStorage();
      navigate('/signup/complete');
    } catch (error) {
      console.error('Signup failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formData, isValid, navigate]);

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
    isLoading,
    isReferralVerifying,
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
    onOver14Change,
    onTermsAgreedChange,
    onPrivacyAgreedChange,
    onAllAgreeChange,
    onTermsDetailClick,
    onPrivacyDetailClick,
    onSubmit,
  };
}
