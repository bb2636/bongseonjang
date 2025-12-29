import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCart, useToast } from '../../../contexts';
import { InvestmentInfo } from '../types/investmentInfo';
import { fetchInvestmentInfos } from '../api/investmentInfoApi';

export function useInvestmentInfoListPage() {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { showToast } = useToast();

  const { data: investmentInfos = [], isLoading, error } = useQuery({
    queryKey: ['investmentInfos'],
    queryFn: fetchInvestmentInfos,
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    if (error) {
      showToast('투자정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.', 'error');
    }
  }, [error, showToast]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleInvestmentInfoClick = (investmentInfoId: string) => {
    navigate(`/investment-info/${investmentInfoId}`);
  };

  return {
    state: {
      investmentInfos,
      isLoading,
      cartCount,
    },
    actions: {
      handleBack,
      handleCartClick,
      handleInvestmentInfoClick,
    },
  };
}
