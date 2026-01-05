import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { useGoBack } from '../../../hooks/useGoBack';

export function useProfileWithdraw() {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { logout } = useAuth();
  const { showToast } = useToast();
  
  const [isAgreed, setIsAgreed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleBack = () => {
    goBack();
  };

  const handleAgreedChange = (value: boolean) => {
    setIsAgreed(value);
  };

  const handleWithdrawClick = () => {
    if (!isAgreed) return;
    setShowConfirmModal(true);
  };

  const handleConfirmCancel = () => {
    setShowConfirmModal(false);
  };

  const handleConfirmWithdraw = async () => {
    setIsWithdrawing(true);
    setShowConfirmModal(false);

    try {
      const token = localStorage.getItem('user_token');
      const response = await fetch('/api/profile/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        logout();
        showToast('회원 탈퇴가 완료되었습니다', 'success');
        navigate('/', { replace: true });
        return;
      }

      let errorMessage = '탈퇴 처리에 실패했습니다';
      try {
        const result = await response.json();
        if (result.error) {
          errorMessage = result.error;
        }
      } catch {
        // ignore JSON parse error
      }
      showToast(errorMessage, 'error');
    } catch {
      showToast('탈퇴 처리 중 오류가 발생했습니다', 'error');
    } finally {
      setIsWithdrawing(false);
    }
  };

  return {
    isAgreed,
    showConfirmModal,
    isWithdrawing,
    handleBack,
    handleAgreedChange,
    handleWithdrawClick,
    handleConfirmCancel,
    handleConfirmWithdraw,
  };
}
