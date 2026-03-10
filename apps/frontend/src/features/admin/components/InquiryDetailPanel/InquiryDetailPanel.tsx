import { useState, useEffect } from 'react';
import { ConfirmDialog } from '../ConfirmDialog';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { API_BASE_URL } from '@/shared/config/apiConfig';
import './InquiryDetailPanel.css';

type InquiryType = 'product' | 'shipping' | 'exchange_return' | 'refund' | 'other';

interface InquiryDetail {
  id: number;
  inquiryType: InquiryType;
  productId: string | null;
  productName: string | null;
  authorId: string;
  authorName: string;
  authorPhone: string | null;
  question: string;
  answer: string | null;
  answeredAt: string | null;
  answeredBy: string | null;
  answererName: string | null;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

interface InquiryDetailPanelProps {
  inquiryId: number;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
  product: '상품문의',
  shipping: '배송문의',
  exchange_return: '교환반품문의',
  refund: '환불문의',
  other: '기타',
};

export function InquiryDetailPanel({ inquiryId, isOpen, onClose, onSaved, onSuccess, onError }: InquiryDetailPanelProps) {
  useBodyScrollLock(isOpen);
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && inquiryId) {
      fetchInquiry();
      setIsAnswering(false);
      setAnswerText('');
    }
  }, [isOpen, inquiryId]);

  const getAuthHeaders = () => {
    const token = sessionStorage.getItem('admin_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const fetchInquiry = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/inquiries/${inquiryId}`, {
        headers: {
          ...getAuthHeaders(),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setInquiry(data);
        if (data.answer) {
          setAnswerText(data.answer);
        }
      }
    } catch (error) {
      console.error('Failed to fetch inquiry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerClick = () => {
    setIsAnswering(true);
  };

  const handleCancelAnswer = () => {
    setAnswerText(inquiry?.answer || '');
    setIsAnswering(false);
  };

  const handleSaveClick = () => {
    if (!answerText.trim()) {
      onError?.('답변 내용을 입력해주세요.');
      return;
    }
    setShowSaveConfirm(true);
  };

  const handleSaveConfirm = async () => {
    setShowSaveConfirm(false);
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/inquiries/${inquiryId}/answer`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({
          answer: answerText,
        }),
      });

      if (response.ok) {
        onSaved();
        onClose();
        onSuccess?.('답변이 등록되었습니다');
      } else {
        onError?.('답변 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to save answer:', error);
      onError?.('답변 등록에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const isAnswered = inquiry?.answer !== null;

  return (
    <>
      <div 
        className={`inquiry-panel-overlay ${isOpen ? 'inquiry-panel-overlay--visible' : ''}`}
        onClick={onClose}
      />
      <div className={`inquiry-panel ${isOpen ? 'inquiry-panel--open' : ''}`}>
        <div className="inquiry-panel__header">
          <h3 className="inquiry-panel__title">문의 상세</h3>
          <button 
            type="button" 
            className="inquiry-panel__close-button"
            onClick={onClose}
            aria-label="닫기"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5 5.5L5.5 16.5M5.5 5.5L16.5 16.5" stroke="#101112" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="inquiry-panel__content">
          {isLoading ? (
            <div className="inquiry-panel__loading">로딩 중...</div>
          ) : inquiry ? (
            <>
              <div className="inquiry-panel__field">
                <label className="inquiry-panel__label">문의 유형</label>
                <div className="inquiry-panel__type-badge">
                  {INQUIRY_TYPE_LABELS[inquiry.inquiryType]}
                </div>
              </div>

              <div className="inquiry-panel__field">
                <label className="inquiry-panel__label">작성자</label>
                <div className="inquiry-panel__value">
                  {inquiry.authorName}{inquiry.authorPhone && ` (${inquiry.authorPhone})`}
                </div>
              </div>

              {inquiry.productName && (
                <div className="inquiry-panel__field">
                  <label className="inquiry-panel__label">문의 상품</label>
                  <div className="inquiry-panel__value">{inquiry.productName}</div>
                </div>
              )}

              <div className="inquiry-panel__field inquiry-panel__field--content">
                <label className="inquiry-panel__label">문의 내용</label>
                <div className="inquiry-panel__value inquiry-panel__value--content">
                  {inquiry.question}
                </div>
              </div>

              {inquiry.imageUrls && inquiry.imageUrls.length > 0 && (
                <div className="inquiry-panel__field">
                  <label className="inquiry-panel__label">첨부 이미지</label>
                  <div className="inquiry-panel__images">
                    {inquiry.imageUrls.map((url, index) => (
                      <button 
                        key={index} 
                        type="button"
                        className="inquiry-panel__image-button"
                        onClick={() => setLightboxImage(url)}
                      >
                        <img 
                          src={url} 
                          alt={`첨부 이미지 ${index + 1}`} 
                          className="inquiry-panel__image"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="inquiry-panel__field">
                <label className="inquiry-panel__label">답변 상태</label>
                <div className={`inquiry-panel__status-badge ${isAnswered ? 'inquiry-panel__status-badge--answered' : 'inquiry-panel__status-badge--unanswered'}`}>
                  {isAnswered ? '답변 완료' : '답변 전'}
                </div>
              </div>

              <div className="inquiry-panel__field inquiry-panel__field--answer">
                <label className="inquiry-panel__label">답변</label>
                {isAnswering || !inquiry.answer ? (
                  <textarea
                    className="inquiry-panel__textarea"
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="답변 내용을 입력하세요"
                  />
                ) : (
                  <div className="inquiry-panel__value inquiry-panel__value--answer">
                    {inquiry.answer}
                  </div>
                )}
              </div>

              <div className="inquiry-panel__meta">
                <span>등록일: {formatDate(inquiry.createdAt)}</span>
                {inquiry.answeredAt && (
                  <span>답변일: {formatDate(inquiry.answeredAt)}</span>
                )}
                {isAnswered && (
                  <span>답변자: {inquiry.answererName ?? '관리자'}</span>
                )}
              </div>
            </>
          ) : (
            <div className="inquiry-panel__loading">문의를 찾을 수 없습니다.</div>
          )}
        </div>

        <div className="inquiry-panel__footer">
          {inquiry && (
            <>
              {isAnswering || !inquiry.answer ? (
                <>
                  {inquiry.answer && (
                    <button 
                      type="button" 
                      className="inquiry-panel__button inquiry-panel__button--cancel"
                      onClick={handleCancelAnswer}
                    >
                      취소
                    </button>
                  )}
                  <button 
                    type="button" 
                    className="inquiry-panel__button inquiry-panel__button--save"
                    onClick={handleSaveClick}
                    disabled={isSaving}
                  >
                    {isSaving ? '저장 중...' : '답변 등록'}
                  </button>
                </>
              ) : (
                <button 
                  type="button" 
                  className="inquiry-panel__button inquiry-panel__button--edit"
                  onClick={handleAnswerClick}
                >
                  답변 수정
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showSaveConfirm}
        title="답변을 등록하시겠습니까?"
        subtitle="등록 즉시 고객에게 노출됩니다"
        cancelText="취소"
        confirmText="확인"
        onCancel={() => setShowSaveConfirm(false)}
        onConfirm={handleSaveConfirm}
      />

      {lightboxImage && (
        <div 
          className="inquiry-panel__lightbox"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            type="button"
            className="inquiry-panel__lightbox-close"
            onClick={() => setLightboxImage(null)}
            aria-label="닫기"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <img 
            src={lightboxImage} 
            alt="확대 이미지" 
            className="inquiry-panel__lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
