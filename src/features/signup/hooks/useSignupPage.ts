import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignupFormState } from './useSignupFormState';
import { useSignupEmailStep } from './useSignupEmailStep';
import { useSignupPasswordStep } from './useSignupPasswordStep';
import { useSignupProfileStep } from './useSignupProfileStep';

export function useSignupPage() {
  const navigate = useNavigate();
  const { formData, updateFormData } = useSignupFormState();
  
  const emailStep = useSignupEmailStep();
  const passwordStep = useSignupPasswordStep();
  const profileStep = useSignupProfileStep();

  const currentStep: 'email' | 'password' | 'profile' = formData.isPasswordSet 
    ? 'profile' 
    : formData.isEmailVerified 
      ? 'password' 
      : 'email';

  const onBack = useCallback(() => {
    if (currentStep === 'profile') {
      updateFormData({ isPasswordSet: false });
    } else if (currentStep === 'password') {
      updateFormData({ isEmailVerified: false, isCodeSent: false, verificationCode: '' });
    } else {
      navigate(-1);
    }
  }, [currentStep, updateFormData, navigate]);

  return {
    currentStep,
    emailStep,
    passwordStep,
    profileStep,
    onBack,
  };
}
