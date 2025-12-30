import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { couponApi } from '../api/couponApi';

export function useMyCouponPage() {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-coupons'],
    queryFn: () => couponApi.getMyCoupons(),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const handleBack = () => {
    navigate(-1);
  };

  const handleGoToDownload = () => {
    navigate('/coupons/download');
  };

  return {
    state: {
      coupons: data?.coupons ?? [],
      totalCount: data?.totalCount ?? 0,
      isLoading,
      error: error as Error | null,
    },
    actions: {
      onBack: handleBack,
      onGoToDownload: handleGoToDownload,
    },
  };
}
