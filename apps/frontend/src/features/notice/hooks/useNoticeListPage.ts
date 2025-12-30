import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useGoBack } from '../../../hooks/useGoBack';
import { useCart, useToast } from '../../../contexts';
import { Notice } from '../types/notice';
import { fetchNotices } from '../api/noticeApi';

export function useNoticeListPage() {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { cartCount } = useCart();
  const { showToast } = useToast();

  const { data: notices = [], isLoading, error } = useQuery({
    queryKey: ['notices'],
    queryFn: fetchNotices,
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    if (error) {
      showToast('공지사항을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.', 'error');
    }
  }, [error, showToast]);

  const handleBack = () => {
    goBack();
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleNoticeClick = (noticeId: string) => {
    navigate(`/notice/${noticeId}`);
  };

  return {
    state: {
      notices,
      isLoading,
      cartCount,
    },
    actions: {
      handleBack,
      handleCartClick,
      handleNoticeClick,
    },
  };
}
