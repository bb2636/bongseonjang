import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { couponApi } from '../api/couponApi';

export function useMyCouponPage() {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-coupons'],
    queryFn: () => couponApi.getMyCoupons(),
    staleTime: 1000 * 60 * 5,
  });

  const handleBack = () => {
    navigate(-1);
  };

  const handleGoToDownload = () => {
    navigate('/coupons/download');
  };

  return {
    coupons: data?.coupons ?? [],
    totalCount: data?.totalCount ?? 0,
    isLoading,
    error: error as Error | null,
    onBack: handleBack,
    onGoToDownload: handleGoToDownload,
  };
}
