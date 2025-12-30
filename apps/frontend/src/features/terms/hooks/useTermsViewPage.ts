import { useCallback, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
import { useGoBack } from '../../../hooks/useGoBack';
import { useTermsContent } from './useTermsContent';
import type { TermsType, TermsContent } from '../types/terms';

interface TermsOption {
  value: TermsType;
  label: string;
}

const TERMS_OPTIONS: TermsOption[] = [
  { value: 'SERVICE', label: '서비스 이용약관 동의' },
  { value: 'PRIVACY_POLICY', label: '개인정보 처리방침' },
  { value: 'PURCHASE_POLICY', label: '구매 정책' },
];

function isValidTermsType(type: string | null): type is TermsType {
  return type === 'SERVICE' || type === 'PRIVACY_POLICY' || type === 'PURCHASE_POLICY';
}

export function useTermsViewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cartCount } = useCart();
  const goBack = useGoBack();
  
  const typeParam = searchParams.get('type');
  const initialType = isValidTermsType(typeParam) ? typeParam : 'SERVICE';
  
  const [selectedType, setSelectedType] = useState<TermsType>(initialType);
  const { terms, isLoading, error } = useTermsContent(selectedType);

  useEffect(() => {
    if (isValidTermsType(typeParam) && typeParam !== selectedType) {
      setSelectedType(typeParam);
    }
  }, [typeParam]);

  const onTypeChange = useCallback((type: TermsType) => {
    setSelectedType(type);
  }, []);

  const onBack = useCallback(() => {
    goBack();
  }, [goBack]);

  const onCartClick = useCallback(() => {
    navigate('/cart');
  }, [navigate]);

  return {
    state: {
      selectedType,
      options: TERMS_OPTIONS,
      content: terms,
      isLoading,
      error,
      cartCount,
    },
    actions: {
      onTypeChange,
      onBack,
      onCartClick,
    },
  };
}
