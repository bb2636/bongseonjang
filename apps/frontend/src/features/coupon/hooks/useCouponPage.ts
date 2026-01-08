import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { couponApi } from '../api/couponApi';
import { useToast } from '../../../contexts';
import { useGoBack } from '../../../hooks/useGoBack';

const REFETCH_INTERVAL_MS = 60000;

export function useCouponPage() {
  const goBack = useGoBack();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => couponApi.getCoupons(),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: REFETCH_INTERVAL_MS,
  });

  const validCoupons = useMemo(() => {
    if (!data?.coupons) return [];
    const now = new Date();
    return data.coupons
      .filter(coupon => {
        if (coupon.validTo && new Date(coupon.validTo) < now) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const aTime = new Date(a.validTo).getTime();
        const bTime = new Date(b.validTo).getTime();
        return aTime - bTime;
      });
  }, [data?.coupons]);

  const issueMutation = useMutation({
    mutationFn: (couponId: string) => couponApi.issueCoupon(couponId),
    onSuccess: (_, couponId) => {
      queryClient.setQueryData(['coupons'], (old: typeof data) => {
        if (!old) return old;
        return {
          ...old,
          coupons: old.coupons.map(coupon =>
            coupon.id === couponId ? { ...coupon, isIssued: true } : coupon
          ),
        };
      });
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      queryClient.invalidateQueries({ queryKey: ['my-coupons'] });
      showToast('쿠폰이 발급되었습니다');
    },
    onError: (error: Error) => {
      showToast(error.message);
    },
  });

  const handleBack = () => {
    goBack();
  };

  const handleIssueCoupon = (couponId: string) => {
    issueMutation.mutate(couponId);
  };

  return {
    state: {
      coupons: validCoupons,
      totalCount: validCoupons.length,
      isLoading,
      error: error as Error | null,
      isIssuing: issueMutation.isPending,
    },
    actions: {
      onBack: handleBack,
      onIssueCoupon: handleIssueCoupon,
    },
  };
}
