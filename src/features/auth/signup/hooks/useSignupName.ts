import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SIGNUP_MESSAGES, SIGNUP_VALIDATION } from '../constants';
import { sendVerificationCode, verifyCode } from '../../../../services/emailVerificationService';
import { verifyReferralId } from '../../../../services/referralService';

interface SignupEmailState {
  email: string;
  verificationCode: string;
  isCodeSent: boolean;
  isEmailVerified: boolean;
  password: string;
  passwordConfirm: string;
  showPassword: boolean;
  showPasswordConfirm: boolean;
  isPasswordSet: boolean;
  name: string;
  phone: string;
  isPhoneVerified: boolean;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  gender: 'male' | 'female' | '';
  referralId: string;
  isReferralIdVerified: boolean;
  isOver14: boolean;
  termsAgreed: boolean;
  privacyAgreed: boolean;
}

interface SignupEmailErrors {
  email: string | null;
  verificationCode: string | null;
  password: string | null;
  passwordConfirm: string | null;
  name: string | null;
  phone: string | null;
  birthDate: string | null;
  gender: string | null;
  referralId: string | null;
}

interface TouchedFields {
  email: boolean;
  verificationCode: boolean;
  password: boolean;
  passwordConfirm: boolean;
  name: boolean;
  phone: boolean;
  birthDate: boolean;
  gender: boolean;
  referralId: boolean;
}

const TIMER_DURATION = 180;
const STORAGE_KEY = 'signupFormData';

function loadFormDataFromStorage(): Partial<SignupEmailState> {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load form data from storage:', error);
  }
  return {};
}

function saveFormDataToStorage(data: SignupEmailState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save form data to storage:', error);
  }
}

export function useSignupEmail() {
  const navigate = useNavigate();
  
  const getInitialFormData = (): SignupEmailState => {
    const defaultData: SignupEmailState = {
      email: '',
      verificationCode: '',
      isCodeSent: false,
      isEmailVerified: false,
      password: '',
      passwordConfirm: '',
      showPassword: false,
      showPasswordConfirm: false,
      isPasswordSet: false,
      name: '',
      phone: '',
      isPhoneVerified: false,
      birthYear: '',
      birthMonth: '',
      birthDay: '',
      gender: '',
      referralId: '',
      isReferralIdVerified: false,
      isOver14: false,
      termsAgreed: false,
      privacyAgreed: false,
    };
    const storedData = loadFormDataFromStorage();
    return { ...defaultData, ...storedData };
  };

  const [formData, setFormData] = useState<SignupEmailState>(getInitialFormData);
  
  const [touched, setTouched] = useState<TouchedFields>({
    email: false,
    verificationCode: false,
    password: false,
    passwordConfirm: false,
    name: false,
    phone: false,
    birthDate: false,
    gender: false,
    referralId: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isReferralVerifying, setIsReferralVerifying] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralModalMessage, setReferralModalMessage] = useState('');
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

  useEffect(() => {
    saveFormDataToStorage(formData);
  }, [formData]);

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

  const errors: SignupEmailErrors = {
    email: touched.email ? validateEmail(formData.email) : null,
    verificationCode: touched.verificationCode ? validateCode(formData.verificationCode) : null,
    password: touched.password ? validatePassword(formData.password) : null,
    passwordConfirm: touched.passwordConfirm ? validatePasswordConfirm(formData.passwordConfirm, formData.password) : null,
    name: touched.name ? validateName(formData.name) : null,
    phone: touched.phone ? validatePhone(formData.phone) : null,
    birthDate: touched.birthDate ? validateBirthDate(formData.birthYear, formData.birthMonth, formData.birthDay) : null,
    gender: touched.gender ? validateGender(formData.gender) : null,
    referralId: touched.referralId ? validateReferralId(formData.referralId) : null,
  };

  const isEmailValid = !validateEmail(formData.email);
  const isCodeValid = !validateCode(formData.verificationCode);
  const isPasswordValid = !validatePassword(formData.password);
  const isPasswordConfirmValid = !validatePasswordConfirm(formData.passwordConfirm, formData.password);
  const isNameValid = !validateName(formData.name);
  const isPhoneValid = !validatePhone(formData.phone);
  const isBirthDateValid = !validateBirthDate(formData.birthYear, formData.birthMonth, formData.birthDay);
  const isGenderValid = !validateGender(formData.gender);
  const isReferralIdValid = !validateReferralId(formData.referralId);
  const isAgreementValid = formData.isOver14 && formData.termsAgreed && formData.privacyAgreed;
  const isValid = isEmailValid && formData.isEmailVerified && isPasswordValid && isPasswordConfirmValid && formData.isPasswordSet && isNameValid && isPhoneValid && isBirthDateValid && isGenderValid && isReferralIdValid && isAgreementValid;

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

  const onNameChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, name: value }));
  }, []);

  const onPhoneChange = useCallback((value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, phone: numbersOnly }));
  }, []);

  const onNameBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, name: true }));
  }, []);

  const onPhoneBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, phone: true }));
  }, []);

  const onPhoneVerify = useCallback(() => {
    setTouched(prev => ({ ...prev, phone: true }));
    if (isPhoneValid) {
      setFormData(prev => ({ ...prev, isPhoneVerified: true }));
    }
  }, [isPhoneValid]);

  const onBirthYearChange = useCallback((value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 4);
    setFormData(prev => ({ ...prev, birthYear: numbersOnly }));
  }, []);

  const onBirthMonthChange = useCallback((value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 2);
    setFormData(prev => ({ ...prev, birthMonth: numbersOnly }));
  }, []);

  const onBirthDayChange = useCallback((value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 2);
    setFormData(prev => ({ ...prev, birthDay: numbersOnly }));
  }, []);

  const onBirthDateBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, birthDate: true }));
  }, []);

  const onGenderChange = useCallback((value: 'male' | 'female') => {
    setFormData(prev => ({ ...prev, gender: value }));
    setTouched(prev => ({ ...prev, gender: true }));
  }, []);

  const onReferralIdChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, referralId: value, isReferralIdVerified: false }));
  }, []);

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
        setFormData(prev => ({ ...prev, isReferralIdVerified: true }));
        setReferralModalMessage('추천인 아이디가 확인되었습니다');
        setShowReferralModal(true);
      } else {
        setFormData(prev => ({ ...prev, isReferralIdVerified: false }));
        setReferralModalMessage('입력하신 아이디를 확인해주세요');
        setShowReferralModal(true);
      }
    } catch (error) {
      setReferralModalMessage('추천인 확인에 실패했습니다');
      setShowReferralModal(true);
      setFormData(prev => ({ ...prev, isReferralIdVerified: false }));
    } finally {
      setIsReferralVerifying(false);
    }
  }, [formData.referralId]);

  const onCloseReferralModal = useCallback(() => {
    setShowReferralModal(false);
    setReferralModalMessage('');
  }, []);

  const onOver14Change = useCallback((value: boolean) => {
    setFormData(prev => ({ ...prev, isOver14: value }));
  }, []);

  const onTermsAgreedChange = useCallback((value: boolean) => {
    setFormData(prev => ({ ...prev, termsAgreed: value }));
  }, []);

  const onPrivacyAgreedChange = useCallback((value: boolean) => {
    setFormData(prev => ({ ...prev, privacyAgreed: value }));
  }, []);

  const onAllAgreeChange = useCallback((value: boolean) => {
    setFormData(prev => ({
      ...prev,
      isOver14: value,
      termsAgreed: value,
      privacyAgreed: value,
    }));
  }, []);

  const onTermsDetailClick = useCallback(() => {
    navigate('/terms');
  }, [navigate]);

  const onPrivacyDetailClick = useCallback(() => {
    navigate('/privacy');
  }, [navigate]);

  const onPasswordNext = useCallback(() => {
    setTouched(prev => ({ ...prev, password: true, passwordConfirm: true }));
    
    if (isPasswordValid && isPasswordConfirmValid) {
      setFormData(prev => ({ ...prev, isPasswordSet: true }));
    }
  }, [isPasswordValid, isPasswordConfirmValid]);

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
    setTouched({ email: true, verificationCode: true, password: true, passwordConfirm: true, name: true, phone: true, birthDate: true, gender: true, referralId: true });

    if (!isValid) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('Signup data:', formData);
      sessionStorage.removeItem(STORAGE_KEY);
      navigate('/signup/complete');
    } catch (error) {
      console.error('Signup failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formData, isValid, navigate]);

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
      isPasswordSet: formData.isPasswordSet,
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
      isReferralVerifying,
      isLoading,
      isVerifying,
      isConfirming,
      isEmailValid,
      isCodeValid,
      isPasswordValid,
      isPasswordConfirmValid,
      isNameValid,
      isPhoneValid,
      isBirthDateValid,
      isGenderValid,
      isReferralIdValid,
      isAgreementValid,
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
      showReferralModal,
      referralModalMessage,
      onPasswordNext,
      onVerifyEmail,
      onResendCode,
      onConfirmCode,
      onCloseErrorModal,
      onOver14Change,
      onTermsAgreedChange,
      onPrivacyAgreedChange,
      onAllAgreeChange,
      onTermsDetailClick,
      onPrivacyDetailClick,
      onSubmit,
      onBack,
    },
  };
}
