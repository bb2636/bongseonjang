import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useGoBack } from '../../../hooks/useGoBack';
import { fetchOrderHistory, OrderHistoryEntry } from '../api/orderHistoryApi';
import { useToast } from '../../../contexts/ToastContext';

export function useInProgressOrders() {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { showToast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['orderHistory', 'shipping'],
    queryFn: () => fetchOrderHistory('shipping'),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (error) {
      showToast('주문내역을 불러오는데 실패했습니다', 'error');
    }
  }, [error, showToast]);

  const handleBack = () => {
    goBack();
  };

  const handleOrderClick = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const orders: OrderHistoryEntry[] = data?.orders || [];

  return {
    orders,
    isLoading,
    handleBack,
    handleOrderClick,
    handleCartClick,
  };
}
