import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SIGNUP_MESSAGES } from '../constants';

interface SignupNameState {
  name: string;
}

interface SignupNameErrors {
  name: string | null;
}

interface TouchedFields {
  name: boolean;
}

export function useSignupName() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<SignupNameState>({
    name: '',
  });
  
  const [touched, setTouched] = useState<TouchedFields>({
    name: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const validateName = useCallback((value: string): string | null => {
    if (!value.trim()) {
      return SIGNUP_MESSAGES.NAME_REQUIRED;
    }
    return null;
  }, []);

  const errors: SignupNameErrors = {
    name: touched.name ? validateName(formData.name) : null,
  };

  const isValid = !validateName(formData.name);

  const onNameChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, name: value }));
  }, []);

  const onNameBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, name: true }));
  }, []);

  const onSubmit = useCallback(async () => {
    setTouched({ name: true });

    if (!isValid) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('Signup name:', formData);
    } catch (error) {
      console.error('Signup failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formData, isValid]);

  const onBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return {
    signupName: {
      name: formData.name,
      isLoading,
      isValid,
      errors,
      onNameChange,
      onNameBlur,
      onSubmit,
      onBack,
    },
  };
}
