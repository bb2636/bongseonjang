import { useEffect, useState } from 'react';
import { fetchLatestTerms } from '../api/termsApi';
import type { TermsContent, TermsType } from '../types/terms';

interface UseTermsContentState {
  terms: TermsContent | null;
  isLoading: boolean;
  error?: string;
}

export function useTermsContent(type: TermsType = 'SERVICE'): UseTermsContentState {
  const [state, setState] = useState<UseTermsContentState>({ terms: null, isLoading: true });

  useEffect(() => {
    let isMounted = true;

    fetchLatestTerms(type)
      .then(data => {
        if (isMounted) {
          setState({ terms: data, isLoading: false });
        }
      })
      .catch(error => {
        if (isMounted) {
          setState({ terms: null, isLoading: false, error: error.message || '약관을 불러오지 못했습니다.' });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [type]);

  return state;
}
