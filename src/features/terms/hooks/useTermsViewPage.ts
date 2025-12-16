import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../contexts/CartContext';
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

export interface TermsViewPageState {
  selectedType: TermsType;
  options: TermsOption[];
  content: TermsContent | null;
  isLoading: boolean;
  error?: string;
  cartCount: number;
  onTypeChange: (type: TermsType) => void;
  onBack: () => void;
  onCartClick: () => void;
}

export function useTermsViewPage(): TermsViewPageState {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [selectedType, setSelectedType] = useState<TermsType>('SERVICE');
  const { terms, isLoading, error } = useTermsContent(selectedType);

  const onTypeChange = useCallback((type: TermsType) => {
    setSelectedType(type);
  }, []);

  const onBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onCartClick = useCallback(() => {
    navigate('/cart');
  }, [navigate]);

  return {
    selectedType,
    options: TERMS_OPTIONS,
    content: terms,
    isLoading,
    error,
    cartCount,
    onTypeChange,
    onBack,
    onCartClick,
  };
}
