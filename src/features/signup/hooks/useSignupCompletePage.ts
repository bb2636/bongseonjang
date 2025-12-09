import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useSignupCompletePage() {
  const navigate = useNavigate();

  const onButtonClick = useCallback(() => {
    sessionStorage.removeItem('signupFormData');
    navigate('/');
  }, [navigate]);

  return {
    onButtonClick,
  };
}
