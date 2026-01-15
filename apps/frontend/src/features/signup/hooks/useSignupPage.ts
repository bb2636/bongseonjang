import { useCallback } from 'react';
import { useSignupFormState } from './useSignupFormState';
import { useGoBack } from '../../../hooks/useGoBack';
import { useSignupEmailStep } from './useSignupEmailStep';
import { useSignupPasswordStep } from './useSignupPasswordStep';
import { useSignupProfileStep } from './useSignupProfileStep';

export function useSignupPage() {
  const goBack = useGoBack();
  const { formData, updateFormData } = useSignupFormState();
  
  const emailStep = useSignupEmailStep();
  const passwordStep = useSignupPasswordStep();
  const profileStep = useSignupProfileStep();

  const isSocialSignup = !!formData.socialProvider;

  const currentStep: 'email' | 'password' | 'profile' = formData.isPasswordSet 
    ? 'profile' 
    : formData.isEmailVerified 
      ? 'password' 
      : 'email';

  const onBack = useCallback(() => {
    if (currentStep === 'profile') {
      updateFormData({ 
        isPasswordSet: false,
        isPhoneVerified: false,
        isReferralIdVerified: false,
      });
    } else if (currentStep === 'password') {
      updateFormData({ 
        isEmailVerified: false, 
        isCodeSent: false, 
        verificationCode: '',
        password: '',
        passwordConfirm: '',
      });
    } else {
      goBack();
    }
  }, [currentStep, updateFormData, goBack]);

  return {
    state: {
      currentStep,
      emailStep,
      passwordStep,
      profileStep,
      isSocialSignup,
    },
    actions: {
      onBack,
    },
  };
}
