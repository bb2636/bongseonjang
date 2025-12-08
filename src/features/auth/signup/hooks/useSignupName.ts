import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SIGNUP_MESSAGES, SIGNUP_VALIDATION } from '../constants';

interface SignupEmailState {
  email: string;
  isEmailVerified: boolean;
}

interface SignupEmailErrors {
  email: string | null;
}

interface TouchedFields {
  email: boolean;
}

export function useSignupEmail() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<SignupEmailState>({
    email: '',
    isEmailVerified: false,
  });
  
  const [touched, setTouched] = useState<TouchedFields>({
    email: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const validateEmail = useCallback((value: string): string | null => {
    if (!value.trim()) {
      return SIGNUP_MESSAGES.REQUIRED;
    }
    if (!SIGNUP_VALIDATION.EMAIL_REGEX.test(value)) {
      return SIGNUP_MESSAGES.EMAIL_INVALID;
    }
    return null;
  }, []);

  const errors: SignupEmailErrors = {
    email: touched.email ? validateEmail(formData.email) : null,
  };

  const isEmailValid = !validateEmail(formData.email);
  const isValid = isEmailValid && formData.isEmailVerified;

  const onEmailChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, email: value, isEmailVerified: false }));
  }, []);

  const onEmailBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, email: true }));
  }, []);

  const onVerifyEmail = useCallback(async () => {
    setTouched({ email: true });
    
    if (!isEmailValid) {
      return;
    }

    setIsVerifying(true);
    try {
      console.log('Verify email:', formData.email);
      setFormData(prev => ({ ...prev, isEmailVerified: true }));
    } catch (error) {
      console.error('Email verification failed:', error);
    } finally {
      setIsVerifying(false);
    }
  }, [formData.email, isEmailValid]);

  const onSubmit = useCallback(async () => {
    setTouched({ email: true });

    if (!isValid) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('Signup email:', formData);
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
    signupEmail: {
      email: formData.email,
      isEmailVerified: formData.isEmailVerified,
      isLoading,
      isVerifying,
      isEmailValid,
      isValid,
      errors,
      onEmailChange,
      onEmailBlur,
      onVerifyEmail,
      onSubmit,
      onBack,
    },
  };
}
