import { useQuery } from '@tanstack/react-query';
import { useGoBack } from '../../../../hooks/useGoBack';
import { fetchGuestOrderDetail, GuestOrderDetail } from '../../../payment/api/paymentApi';

interface UseGuestOrderDetailResult {
  order: GuestOrderDetail | undefined;
  isLoading: boolean;
  isError: boolean;
  onBack: () => void;
}

export function useGuestOrderDetail(orderId: string): UseGuestOrderDetailResult {
  const goBack = useGoBack();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['guestOrderDetail', orderId],
    queryFn: () => fetchGuestOrderDetail(orderId),
    enabled: !!orderId,
  });

  const onBack = () => {
    goBack();
  };

  return {
    order,
    isLoading,
    isError,
    onBack,
  };
}
