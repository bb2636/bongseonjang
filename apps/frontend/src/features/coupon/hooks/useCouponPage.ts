import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { couponApi } from '../api/couponApi';
import { useToast } from '../../../contexts';

export function useCouponPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => couponApi.getCoupons(),
    staleTime: 1000 * 60 * 5,
  });

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
    navigate(-1);
  };

  const handleIssueCoupon = (couponId: string) => {
    issueMutation.mutate(couponId);
  };

  return {
    state: {
      coupons: data?.coupons ?? [],
      totalCount: data?.totalCount ?? 0,
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
