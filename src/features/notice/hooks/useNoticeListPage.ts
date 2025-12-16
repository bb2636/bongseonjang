import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCart, useToast } from '../../../contexts';
import { Notice } from '../types/notice';
import { fetchNotices } from '../api/noticeApi';

export interface NoticeListPageState {
  notices: Notice[];
  isLoading: boolean;
  cartCount: number;
  handleBack: () => void;
  handleCartClick: () => void;
  handleNoticeClick: (noticeId: string) => void;
}

export function useNoticeListPage(): NoticeListPageState {
  const navigate = useNavigate();
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
    navigate(-1);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleNoticeClick = (noticeId: string) => {
    console.log('Notice clicked:', noticeId);
  };

  return {
    notices,
    isLoading,
    cartCount,
    handleBack,
    handleCartClick,
    handleNoticeClick,
  };
}
