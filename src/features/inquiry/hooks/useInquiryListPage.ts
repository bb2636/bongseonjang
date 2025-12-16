import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { InquiryItem } from '../types/inquiry';
import { fetchMyInquiries } from '../api/inquiryApi';

export interface InquiryListPageState {
  inquiries: InquiryItem[];
  isLoading: boolean;
  error: string | null;
  handleBack: () => void;
  handleCartClick: () => void;
  handleWriteClick: () => void;
  handleInquiryClick: (id: number) => void;
}

export function useInquiryListPage(): InquiryListPageState {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInquiries() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchMyInquiries();
        setInquiries(data);
      } catch (err) {
        console.error('Failed to load inquiries:', err);
        setError('문의 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
    loadInquiries();
  }, []);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleCartClick = useCallback(() => {
    navigate('/cart');
  }, [navigate]);

  const handleWriteClick = useCallback(() => {
    navigate('/inquiry/write');
  }, [navigate]);

  const handleInquiryClick = useCallback((id: number) => {
    navigate(`/inquiry/${id}`);
  }, [navigate]);

  return {
    inquiries,
    isLoading,
    error,
    handleBack,
    handleCartClick,
    handleWriteClick,
    handleInquiryClick,
  };
}
