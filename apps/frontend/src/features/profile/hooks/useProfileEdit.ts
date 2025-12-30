import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { profileApi } from '../api/profileApi';
import { useGoBack } from '../../../hooks/useGoBack';

export function useProfileEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const goBack = useGoBack();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordConfirmError, setPasswordConfirmError] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const email = user?.email || '';

  useEffect(() => {
    const verified = location.state?.verified;
    if (!verified) {
      navigate('/profile/verify', { replace: true });
      return;
    }

    async function loadProfile() {
      try {
        const profile = await profileApi.fetchUserProfile();
        setName(profile.name || '');
        setPhone(profile.phone || '');
        setIsLoading(false);
      } catch {
        showToast('프로필 정보를 불러오는데 실패했습니다', 'error');
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [location.state, navigate, showToast]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (nameError) setNameError(null);
  };

  const handlePhoneChange = (value: string) => {
    const formatted = value.replace(/[^0-9]/g, '');
    setPhone(formatted);
    if (phoneError) setPhoneError(null);
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    if (passwordError) setPasswordError(null);
  };

  const handleNewPasswordConfirmChange = (value: string) => {
    setNewPasswordConfirm(value);
    if (passwordConfirmError) setPasswordConfirmError(null);
  };

  const validateForm = (): boolean => {
    let isValid = true;

    if (!name.trim()) {
      setNameError('성함을 입력해주세요');
      isValid = false;
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        setPasswordError('비밀번호는 8자 이상이어야 합니다');
        isValid = false;
      }
      if (newPassword !== newPasswordConfirm) {
        setPasswordConfirmError('비밀번호가 일치하지 않습니다');
        isValid = false;
      }
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const updateData: {
        name: string;
        phone?: string;
        newPassword?: string;
      } = { name };

      if (phone) updateData.phone = phone;
      if (newPassword) updateData.newPassword = newPassword;

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
    newPassword,
    newPasswordConfirm,
    nameError,
    phoneError,
    passwordError,
    passwordConfirmError,
    isSubmitting,
    isLoading,
    showSuccessModal,
    handleNameChange,
    handlePhoneChange,
    handleNewPasswordChange,
    handleNewPasswordConfirmChange,
    handleSubmit,
    handleBack,
    handleModalConfirm,
    handleWithdrawClick,
  };
}
