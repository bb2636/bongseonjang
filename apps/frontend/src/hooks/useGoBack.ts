import { useCallback } from 'react';
import { useNavigate, useNavigationType } from 'react-router-dom';

export function useGoBack(fallbackPath: string = '/') {
  const navigate = useNavigate();
  const navigationType = useNavigationType();

  const goBack = useCallback(() => {
    if (navigationType === 'POP' || window.history.length <= 2) {
      navigate(fallbackPath, { replace: true });
    } else {
      navigate(-1);
    }
  }, [navigate, navigationType, fallbackPath]);

  return goBack;
}
