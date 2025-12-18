import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { profileApi } from '../api/profileApi';

export function useProfilePasswordVerify() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const email = user?.email || '';

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) {
      setPasswordError(null);
    }
  };

  const handleSubmit = async () => {
    if (!password) {
      setPasswordError('비밀번호를 입력해주세요');
      return;
    }

    setIsSubmitting(true);
    setPasswordError(null);

    try {
      const result = await profileApi.verifyPassword(password);
      
      if (result.success) {
        navigate('/profile/edit', { state: { verified: true } });
      } else {
        setPasswordError(result.message || '비밀번호가 일치하지 않습니다');
      }
    } catch {
      showToast('비밀번호 확인 중 오류가 발생했습니다', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return {
    email,
    password,
    passwordError,
    isSubmitting,
    handlePasswordChange,
    handleSubmit,
    handleBack,
  };
}
