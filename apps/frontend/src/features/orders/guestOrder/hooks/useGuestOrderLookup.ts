import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GUEST_ORDER_MESSAGES } from '../constants';

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

  const validateRequired = useCallback((value: string): string | null => {
    if (!value.trim()) {
      return GUEST_ORDER_MESSAGES.REQUIRED;
    }
    return null;
  }, []);

  const errors: GuestOrderLookupErrors = {
    ordererName: touched.ordererName ? validateRequired(formData.ordererName) : null,
    orderNumber: touched.orderNumber ? validateRequired(formData.orderNumber) : null,
    orderPassword: touched.orderPassword ? validateRequired(formData.orderPassword) : null,
  };

  const isValid = !validateRequired(formData.ordererName) && 
                  !validateRequired(formData.orderNumber) && 
                  !validateRequired(formData.orderPassword);

  const onOrdererNameChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, ordererName: value }));
  }, []);

  const onOrderNumberChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, orderNumber: value }));
  }, []);

  const onOrderPasswordChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, orderPassword: value }));
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
    try {
      console.log('Guest order lookup:', formData);
    } catch (error) {
      console.error('Guest order lookup failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formData, isValid]);

  const onBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return {
    guestOrderLookup: {
      ordererName: formData.ordererName,
      orderNumber: formData.orderNumber,
      orderPassword: formData.orderPassword,
      isLoading,
      isValid,
      errors,
      onOrdererNameChange,
      onOrderNumberChange,
      onOrderPasswordChange,
      onOrdererNameBlur,
      onOrderNumberBlur,
      onOrderPasswordBlur,
      onSubmit,
      onBack,
    },
  };
}
