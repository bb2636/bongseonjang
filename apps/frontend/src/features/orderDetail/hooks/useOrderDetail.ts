import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useGoBack } from '../../../hooks/useGoBack';
import { fetchOrderDetail, OrderDetail } from '../api/orderDetailApi';

interface UseOrderDetailResult {
  order: OrderDetail | undefined;
  isLoading: boolean;
  isError: boolean;
  onBack: () => void;
  onCartClick: () => void;
}

export function useOrderDetail(orderId: string): UseOrderDetailResult {
  const navigate = useNavigate();
  const goBack = useGoBack();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['orderDetail', orderId],
    queryFn: () => fetchOrderDetail(orderId),
    enabled: !!orderId,
  });

  const onBack = () => {
    goBack();
  };

  const onCartClick = () => {
    navigate('/cart');
  };

  return {
    order,
    isLoading,
    isError,
    onBack,
    onCartClick,
  };
}
