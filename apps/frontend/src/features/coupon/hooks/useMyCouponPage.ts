import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { couponApi } from '../api/couponApi';

const REFETCH_INTERVAL_MS = 60000;

export function useMyCouponPage() {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-coupons'],
    queryFn: () => couponApi.getMyCoupons(),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: REFETCH_INTERVAL_MS,
  });

  const validCoupons = useMemo(() => {
    if (!data?.coupons) return [];
    const now = new Date();
    return data.coupons.filter(coupon => {
      if (coupon.validTo && new Date(coupon.validTo) < now) {
        return false;
      }
      return true;
    });
  }, [data?.coupons]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleGoToDownload = () => {
    navigate('/coupons/download');
  };

  return {
    state: {
      coupons: validCoupons,
      totalCount: validCoupons.length,
      isLoading,
      error: error as Error | null,
    },
    actions: {
      onBack: handleBack,
      onGoToDownload: handleGoToDownload,
    },
  };
}
