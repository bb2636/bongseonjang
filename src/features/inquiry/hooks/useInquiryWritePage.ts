import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { InquiryType } from '../types/inquiry';
import { INQUIRY_TYPE_OPTIONS } from '../types/inquiry';
import { createInquiry } from '../api/inquiryApi';

export interface InquiryWritePageState {
  inquiryType: InquiryType;
  question: string;
  isSubmitting: boolean;
  error: string | null;
  typeOptions: typeof INQUIRY_TYPE_OPTIONS;
  handleBack: () => void;
  handleTypeChange: (type: InquiryType) => void;
  handleQuestionChange: (value: string) => void;
  handleSubmit: () => void;
}

export function useInquiryWritePage(): InquiryWritePageState {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  
  const [inquiryType, setInquiryType] = useState<InquiryType>(productId ? 'product' : 'other');
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleTypeChange = useCallback((type: InquiryType) => {
    setInquiryType(type);
  }, []);

  const handleQuestionChange = useCallback((value: string) => {
    setQuestion(value);
    if (error) setError(null);
  }, [error]);

  const handleSubmit = useCallback(async () => {
    if (!question.trim()) {
      setError('문의 내용을 입력해주세요.');
      return;
    }

    if (question.trim().length < 10) {
      setError('문의 내용은 최소 10자 이상 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createInquiry({
        inquiryType,
        productId: productId || undefined,
        question: question.trim(),
      });
      navigate('/inquiry', { replace: true });
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
      setError('문의 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  }, [inquiryType, productId, question, navigate]);

  return {
    inquiryType,
    question,
    isSubmitting,
    error,
    typeOptions: INQUIRY_TYPE_OPTIONS,
    handleBack,
    handleTypeChange,
    handleQuestionChange,
    handleSubmit,
  };
}
