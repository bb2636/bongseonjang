import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoBack } from '../../../../hooks/useGoBack';
import { GUEST_ORDER_MESSAGES } from '../constants';
import { lookupGuestOrder, GuestOrder } from '../../../payment/api/paymentApi';
import { useToast } from '../../../../contexts/ToastContext';

interface GuestOrderLookupState {
  ordererName: string;
  orderNumber: string;
  orderPassword: string;
}

interface GuestOrderLookupErrors {
  ordererName: string | null;
  orderNumber: string | null;
  orderPassword: string | null;
}

interface TouchedFields {
  ordererName: boolean;
  orderNumber: boolean;
  orderPassword: boolean;
}

export function useGuestOrderLookup() {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState<GuestOrderLookupState>({
    ordererName: '',
    orderNumber: '',
    orderPassword: '',
  });
  
  const [touched, setTouched] = useState<TouchedFields>({
    ordererName: false,
    orderNumber: false,
    orderPassword: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<GuestOrder | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const validateRequired = useCallback((value: string): string | null => {
    if (!value.trim()) {
      return GUEST_ORDER_MESSAGES.REQUIRED;
    }
    return null;
  }, []);

  const validatePassword = useCallback((value: string): string | null => {
    if (!value.trim()) {
      return GUEST_ORDER_MESSAGES.REQUIRED;
    }
    if (value.length < 4 || value.length > 6) {
      return '비밀번호는 4~6자리입니다';
    }
    if (!/^\d+$/.test(value)) {
      return '숫자만 입력해주세요';
    }
    return null;
  }, []);

  const errors: GuestOrderLookupErrors = {
    ordererName: touched.ordererName ? validateRequired(formData.ordererName) : null,
    orderNumber: touched.orderNumber ? validateRequired(formData.orderNumber) : null,
    orderPassword: touched.orderPassword ? validatePassword(formData.orderPassword) : null,
  };

  const isValid = !validateRequired(formData.ordererName) &&
                  !validateRequired(formData.orderNumber) && 
                  !validatePassword(formData.orderPassword);

  const onOrdererNameChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, ordererName: value }));
  }, []);

  const onOrderNumberChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, orderNumber: value }));
  }, []);

  const onOrderPasswordChange = useCallback((value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, orderPassword: cleaned }));
  }, []);

  const onOrdererNameBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, ordererName: true }));
  }, []);

  const onOrderNumberBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, orderNumber: true }));
  }, []);

  const onOrderPasswordBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, orderPassword: true }));
  }, []);

  const onSubmit = useCallback(async () => {
    setTouched({ ordererName: true, orderNumber: true, orderPassword: true });

    if (!isValid) {
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const result = await lookupGuestOrder({
        ordererName: formData.ordererName,
        orderNumber: formData.orderNumber,
        orderPassword: formData.orderPassword,
      });
      setOrder(result.order);
    } catch (error) {
      console.error('Guest order lookup failed:', error);
      setOrder(null);
      const errorMessage = error instanceof Error ? error.message : '주문 조회에 실패했습니다';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [formData, isValid, showToast]);

  const onBack = useCallback(() => {
    goBack();
  }, [goBack]);

  const onOrderClick = useCallback((orderId: string) => {
    navigate(`/orders/guest/${orderId}`);
  }, [navigate]);

  return {
    guestOrderLookup: {
      ordererName: formData.ordererName,
      orderNumber: formData.orderNumber,
      orderPassword: formData.orderPassword,
      isLoading,
      isValid,
      errors,
      order,
      hasSearched,
      onOrdererNameChange,
      onOrderNumberChange,
      onOrderPasswordChange,
      onOrdererNameBlur,
      onOrderNumberBlur,
      onOrderPasswordBlur,
      onSubmit,
      onBack,
      onOrderClick,
    },
  };
}
