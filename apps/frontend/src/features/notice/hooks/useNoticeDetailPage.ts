import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useGoBack } from '../../../hooks/useGoBack';
import { useToast } from '../../../contexts';
import { fetchNoticeById } from '../api/noticeApi';

function is404Error(error: unknown): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as { status: number }).status === 404;
  }
  return false;
}

export function useNoticeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { showToast } = useToast();

  const { data: notice, isLoading, error } = useQuery({
    queryKey: ['notice', id],
    queryFn: () => fetchNoticeById(id!),
    enabled: !!id,
    staleTime: 1000 * 60,
    retry: (failureCount, error) => {
      if (is404Error(error)) return false;
      return failureCount < 3;
    },
  });

  const notFound = useMemo(() => {
    if (isLoading) return false;
    if (notice) return false;
    return true;
  }, [isLoading, notice]);

  useEffect(() => {
    if (error && !is404Error(error)) {
      showToast('공지사항을 불러오지 못했습니다.', 'error');
    }
  }, [error, showToast]);

  const handleBack = () => {
    goBack();
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  return {
    state: {
      notice,
      isLoading,
      notFound,
    },
    actions: {
      handleBack,
      handleCartClick,
    },
  };
}
