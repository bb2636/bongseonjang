import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { profileApi } from '../api/profileApi';
import { useGoBack } from '../../../hooks/useGoBack';

export function useProfileEdit() {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
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

  const email = user?.email || '';

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await profileApi.fetchUserProfile();
        setName(profile.name || '');
        setPhone(profile.phone || '');
        
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
  };
}
