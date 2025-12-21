import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GUEST_ORDER_MESSAGES } from '../constants';
import { lookupGuestOrders, GuestOrder } from '../../../payment/api/paymentApi';
import { useToast } from '../../../../contexts/ToastContext';

interface GuestOrderLookupState {
  ordererName: string;
  phone: string;
}

interface GuestOrderLookupErrors {
  ordererName: string | null;
  phone: string | null;
}

interface TouchedFields {
  ordererName: boolean;
  phone: boolean;
}

export function useGuestOrderLookup() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState<GuestOrderLookupState>({
    ordererName: '',
    phone: '',
  });
  
  const [touched, setTouched] = useState<TouchedFields>({
    ordererName: false,
    phone: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<GuestOrder[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const validateRequired = useCallback((value: string): string | null => {
    if (!value.trim()) {
      return GUEST_ORDER_MESSAGES.REQUIRED;
    }
    return null;
  }, []);

  const validatePhone = useCallback((value: string): string | null => {
    if (!value.trim()) {
      return GUEST_ORDER_MESSAGES.REQUIRED;
    }
    const phoneRegex = /^01[0-9]{8,9}$/;
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!phoneRegex.test(cleaned)) {
      return '올바른 휴대폰 번호를 입력해주세요';
    }
    return null;
  }, []);

  const errors: GuestOrderLookupErrors = {
    ordererName: touched.ordererName ? validateRequired(formData.ordererName) : null,
    phone: touched.phone ? validatePhone(formData.phone) : null,
  };

  const isValid = !validateRequired(formData.ordererName) && 
                  !validatePhone(formData.phone);

  const onOrdererNameChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, ordererName: value }));
  }, []);

  const onPhoneChange = useCallback((value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, phone: cleaned }));
  }, []);

  const onOrdererNameBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, ordererName: true }));
  }, []);

  const onPhoneBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, phone: true }));
  }, []);

  const onSubmit = useCallback(async () => {
    setTouched({ ordererName: true, phone: true });

    if (!isValid) {
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const result = await lookupGuestOrders({
        guestName: formData.ordererName,
        guestPhone: formData.phone,
      });
      setOrders(result.orders);
      if (result.orders.length === 0) {
        showToast('조회된 주문이 없습니다', 'info');
      }
    } catch (error) {
      console.error('Guest order lookup failed:', error);
      showToast('주문 조회에 실패했습니다', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [formData, isValid, showToast]);

  const onBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onOrderClick = useCallback((orderId: string) => {
    navigate(`/orders/guest/${orderId}`);
  }, [navigate]);

  return {
    guestOrderLookup: {
      ordererName: formData.ordererName,
      phone: formData.phone,
      isLoading,
      isValid,
      errors,
      orders,
      hasSearched,
      onOrdererNameChange,
      onPhoneChange,
      onOrdererNameBlur,
      onPhoneBlur,
      onSubmit,
      onBack,
      onOrderClick,
    },
  };
}
