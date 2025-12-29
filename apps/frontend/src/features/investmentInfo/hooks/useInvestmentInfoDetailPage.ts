import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '../../../contexts';
import { fetchInvestmentInfoById } from '../api/investmentInfoApi';

function is404Error(error: unknown): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as { status: number }).status === 404;
  }
  return false;
}

export function useInvestmentInfoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data: investmentInfo, isLoading, error } = useQuery({
    queryKey: ['investmentInfo', id],
    queryFn: () => fetchInvestmentInfoById(id!),
    enabled: !!id,
    staleTime: 1000 * 60,
    retry: (failureCount, error) => {
      if (is404Error(error)) return false;
      return failureCount < 3;
    },
  });

  const notFound = useMemo(() => {
    if (isLoading) return false;
    if (investmentInfo) return false;
    return true;
  }, [isLoading, investmentInfo]);

  useEffect(() => {
    if (error && !is404Error(error)) {
      showToast('투자정보를 불러오지 못했습니다.', 'error');
    }
  }, [error, showToast]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  return {
    state: {
      investmentInfo,
      isLoading,
      notFound,
    },
    actions: {
      handleBack,
      handleCartClick,
    },
  };
}
