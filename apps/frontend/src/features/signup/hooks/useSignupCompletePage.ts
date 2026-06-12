import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useSignupCompletePage() {
  const navigate = useNavigate();

  const onButtonClick = useCallback(() => {
    sessionStorage.removeItem('signupFormData');
    sessionStorage.removeItem('pendingSocialLogin');
    sessionStorage.removeItem('pendingSocialProfileData');
    navigate('/');
  }, [navigate]);

  return {
    state: {},
    actions: {
      onButtonClick,
    },
  };
}
