import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchGuestOrderDetail, GuestOrderDetail } from '../../../payment/api/paymentApi';

interface UseGuestOrderDetailResult {
  order: GuestOrderDetail | undefined;
  isLoading: boolean;
  isError: boolean;
  onBack: () => void;
}

export function useGuestOrderDetail(orderId: string): UseGuestOrderDetailResult {
  const navigate = useNavigate();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['guestOrderDetail', orderId],
    queryFn: () => fetchGuestOrderDetail(orderId),
    enabled: !!orderId,
  });

  const onBack = () => {
    navigate(-1);
  };

  return {
    order,
    isLoading,
    isError,
    onBack,
  };
}
