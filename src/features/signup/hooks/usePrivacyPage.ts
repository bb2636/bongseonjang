import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function usePrivacyPage() {
  const navigate = useNavigate();

  const onBack = useCallback(() => {
    navigate('/signup/email');
  }, [navigate]);

  return {
    onBack,
  };
}
