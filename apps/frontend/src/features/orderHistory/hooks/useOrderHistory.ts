import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchOrderHistory, OrderStatusFilter, OrderHistoryEntry } from '../api/orderHistoryApi';
import { useToast } from '../../../contexts/ToastContext';

export function useOrderHistory() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<OrderStatusFilter>('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['orderHistory', activeTab],
    queryFn: () => fetchOrderHistory(activeTab),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (error) {
      showToast('주문내역을 불러오는데 실패했습니다', 'error');
    }
  }, [error, showToast]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleTabChange = (tab: OrderStatusFilter) => {
    setActiveTab(tab);
  };

  const handleOrderClick = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const orders: OrderHistoryEntry[] = data?.orders || [];

  return {
    activeTab,
    orders,
    isLoading,
    handleBack,
    handleTabChange,
    handleOrderClick,
    handleCartClick,
  };
}
