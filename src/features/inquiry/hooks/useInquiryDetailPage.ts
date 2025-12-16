import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { InquiryDetail } from '../types/inquiry';
import { INQUIRY_TYPE_LABELS } from '../types/inquiry';
import { fetchInquiryDetail } from '../api/inquiryApi';

export interface InquiryDetailPageState {
  inquiry: InquiryDetail | null;
  isLoading: boolean;
  error: string | null;
  typeLabels: typeof INQUIRY_TYPE_LABELS;
  handleBack: () => void;
  handleCartClick: () => void;
}

export function useInquiryDetailPage(): InquiryDetailPageState {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInquiry() {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchInquiryDetail(parseInt(id, 10));
        setInquiry(data);
      } catch (err) {
        console.error('Failed to load inquiry:', err);
        setError('문의 내용을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
    loadInquiry();
  }, [id]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleCartClick = useCallback(() => {
    navigate('/cart');
  }, [navigate]);

  return {
    inquiry,
    isLoading,
    error,
    typeLabels: INQUIRY_TYPE_LABELS,
    handleBack,
    handleCartClick,
  };
}
