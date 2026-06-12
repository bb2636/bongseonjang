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

  const socialCompleteMutation = useMutation({
    mutationFn: async () => {
      const pendingLoginData = sessionStorage.getItem('pendingSocialLogin');
      if (!pendingLoginData) {
        throw new Error('소셜 로그인 정보를 확인할 수 없습니다. 다시 로그인해주세요.');
      }

      const pending = JSON.parse(pendingLoginData) as {
        token: string;
        user: { id: string; email: string; name: string };
      };

      await signupService.completeSocialProfile(pending.token, {
        name: formData.name,
        phone: formData.phone || undefined,
        referralId: formData.referralId || undefined,
        addressName: formData.addressName || undefined,
        zonecode: formData.zonecode || undefined,
        address: formData.address || undefined,
        addressDetail: formData.addressDetail || undefined,
      });

      return pending;
    },
    onSuccess: (pending) => {
      loginWithToken(pending.token, {
        id: pending.user.id,
        email: pending.user.email,
        name: pending.user.name,
      });

      sessionStorage.removeItem('pendingSocialLogin');
      sessionStorage.removeItem('pendingSocialProfileData');
      clearFormDataFromStorage();

      navigate('/signup/complete');
    },
    onError: (error: Error) => {
      setErrorModalMessage(error.message || '프로필 저장에 실패했습니다. 다시 시도해주세요.');
      setShowErrorModal(true);
    },
  });

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
    referralId: touched.referralId ? validateReferralId(formData.referralId) : null,
    addressName: touched.addressName ? validateAddressName(formData.addressName) : null,
    address: touched.address ? validateAddress(formData.zonecode, formData.address, formData.addressDetail) : null,
  };

  const isNameValid = !validateName(formData.name);
  const isPhoneValid = !validatePhone(formData.phone);
  const isReferralIdValid = !validateReferralId(formData.referralId);
  const isAddressNameValid = !validateAddressName(formData.addressName);
  const isAddressValid = !validateAddress(formData.zonecode, formData.address, formData.addressDetail);
  const isAgreementValid = formData.isOver14 && formData.termsAgreed && formData.privacyAgreed;
  
  const isValid = isNameValid && isPhoneValid && formData.isPhoneVerified && isReferralIdValid && isAddressNameValid && isAddressValid && isAgreementValid;

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
    
    const result = await signupService.sendPhoneVerificationCode(formData.phone);
    
    if (result.success) {
      setIsPhoneCodeSent(true);
      setPhoneCodeTimer(PHONE_CODE_EXPIRY_SECONDS);
      setTimerTrigger((prev) => prev + 1);
      setPhoneVerificationCode('');
      setPhoneModalMessage('인증번호가 발송되었습니다');
      setIsPhoneVerifySuccess(true);
      setShowPhoneModal(true);
    } else {
      setPhoneModalMessage(result.message);
      setIsPhoneVerifySuccess(false);
      setShowPhoneModal(true);
    }
    
    setIsPhoneCodeSending(false);
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
    
    setIsPhoneCodeVerifying(false);
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
    navigate('/terms');
  }, [navigate]);

  const onPrivacyDetailClick = useCallback(() => {
    navigate('/terms?type=PRIVACY_POLICY');
  }, [navigate]);

  const onAddressDetailBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, address: true }));
  }, []);

  const onSubmit = useCallback(() => {
    setTouched({ name: true, phone: true, referralId: true, addressName: true, address: true });

    if (!isValid) {
      return;
    }

    if (isSocialSignup) {
      if (socialCompleteMutation.isPending) {
        return;
      }

      socialCompleteMutation.mutate();
      return;
    }

    if (signupMutation.isPending) {
      return;
    }

    signupMutation.mutate();
  }, [isValid, signupMutation, socialCompleteMutation, isSocialSignup]);

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
    referralId: formData.referralId,
    isReferralIdVerified: formData.isReferralIdVerified,
    isOver14: formData.isOver14,
    termsAgreed: formData.termsAgreed,
    privacyAgreed: formData.privacyAgreed,
    isLoading: signupMutation.isPending || socialCompleteMutation.isPending,
    isReferralVerifying: referralMutation.isPending,
    isNameValid,
    isPhoneValid,
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
