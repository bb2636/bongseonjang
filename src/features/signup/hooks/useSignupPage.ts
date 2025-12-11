import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignupFormState } from './useSignupFormState';
import { useSignupEmailStep } from './useSignupEmailStep';
import { useSignupPasswordStep } from './useSignupPasswordStep';
import { useSignupProfileStep } from './useSignupProfileStep';

export function useSignupPage() {
  const navigate = useNavigate();
  const { formData } = useSignupFormState();
  
  const emailStep = useSignupEmailStep();
  const passwordStep = useSignupPasswordStep();
  const profileStep = useSignupProfileStep();

  const onBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const currentStep: 'email' | 'password' | 'profile' = formData.isPasswordSet 
    ? 'profile' 
    : formData.isEmailVerified 
      ? 'password' 
      : 'email';

  return {
    currentStep,
    emailStep,
    passwordStep,
    profileStep,
    onBack,
  };
}
