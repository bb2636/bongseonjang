import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTermsContent } from '../../terms/hooks/useTermsContent';

export function useTermsPage() {
  const navigate = useNavigate();
  const { terms, isLoading, error } = useTermsContent('SERVICE');

  const onBack = useCallback(() => {
    navigate('/signup/email');
  }, [navigate]);

  return {
    state: {
      content: terms,
      isLoading,
      error,
    },
    actions: {
      onBack,
    },
  };
}
