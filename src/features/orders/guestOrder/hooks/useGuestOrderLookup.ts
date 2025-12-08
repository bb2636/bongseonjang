import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GUEST_ORDER_MESSAGES, GUEST_ORDER_VALIDATION } from '../constants';

interface GuestOrderLookupState {
  name: string;
  orderNumber: string;
  phone: string;
}

interface GuestOrderLookupErrors {
  name: string | null;
  orderNumber: string | null;
  phone: string | null;
}

interface TouchedFields {
  name: boolean;
  orderNumber: boolean;
  phone: boolean;
}

export function useGuestOrderLookup() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<GuestOrderLookupState>({
    name: '',
    orderNumber: '',
    phone: '',
  });
  
  const [touched, setTouched] = useState<TouchedFields>({
    name: false,
    orderNumber: false,
    phone: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const validateName = useCallback((value: string): string | null => {
    if (!value.trim()) {
      return GUEST_ORDER_MESSAGES.NAME_REQUIRED;
    }
    return null;
  }, []);

  const validateOrderNumber = useCallback((value: string): string | null => {
    if (!value.trim()) {
      return GUEST_ORDER_MESSAGES.ORDER_NUMBER_REQUIRED;
    }
    return null;
  }, []);

  const validatePhone = useCallback((value: string): string | null => {
    if (!value.trim()) {
      return GUEST_ORDER_MESSAGES.PHONE_REQUIRED;
    }
    const normalizedPhone = value.replace(/-/g, '');
    if (!GUEST_ORDER_VALIDATION.PHONE_REGEX.test(normalizedPhone)) {
      return GUEST_ORDER_MESSAGES.PHONE_INVALID;
    }
    return null;
  }, []);

  const errors: GuestOrderLookupErrors = {
    name: touched.name ? validateName(formData.name) : null,
    orderNumber: touched.orderNumber ? validateOrderNumber(formData.orderNumber) : null,
    phone: touched.phone ? validatePhone(formData.phone) : null,
  };

  const isValid = !validateName(formData.name) && 
                  !validateOrderNumber(formData.orderNumber) && 
                  !validatePhone(formData.phone);

  const onNameChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, name: value }));
  }, []);

  const onOrderNumberChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, orderNumber: value }));
  }, []);

  const onPhoneChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, phone: value }));
  }, []);

  const onNameBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, name: true }));
  }, []);

  const onOrderNumberBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, orderNumber: true }));
  }, []);

  const onPhoneBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, phone: true }));
  }, []);

  const onSubmit = useCallback(async () => {
    setTouched({ name: true, orderNumber: true, phone: true });

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
      name: formData.name,
      orderNumber: formData.orderNumber,
      phone: formData.phone,
      isLoading,
      isValid,
      errors,
      onNameChange,
      onOrderNumberChange,
      onPhoneChange,
      onNameBlur,
      onOrderNumberBlur,
      onPhoneBlur,
      onSubmit,
      onBack,
    },
  };
}
