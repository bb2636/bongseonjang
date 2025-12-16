import { AppBar } from '../../../components';
import type { InquiryDetailPageState } from '../hooks/useInquiryDetailPage';
import './InquiryDetailView.css';

interface InquiryDetailViewProps {
  state: InquiryDetailPageState;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function InquiryDetailView({ state }: InquiryDetailViewProps) {
  const {
    inquiry,
    isLoading,
    error,
    typeLabels,
    handleBack,
    handleCartClick,
  } = state;

  return (
    <div className="inquiry-detail-page">
      <AppBar
        title="문의 상세"
        showBackButton
        onBackClick={handleBack}
        showCart
        onCartClick={handleCartClick}
      />

      <main className="inquiry-detail-page__content">
        {isLoading ? (
          <div className="inquiry-detail-page__loading">로딩 중...</div>
        ) : error ? (
          <div className="inquiry-detail-page__error">{error}</div>
        ) : inquiry ? (
          <>
            <div className="inquiry-detail__question-section">
              <div className="inquiry-detail__header">
                <span className="inquiry-detail__type">
                  {typeLabels[inquiry.inquiryType]}
                </span>
                <span className="inquiry-detail__date">
                  {formatDate(inquiry.createdAt)}
                </span>
              </div>

              {inquiry.productName && (
                <div className="inquiry-detail__product">
                  <p className="inquiry-detail__product-label">문의 상품</p>
                  <p className="inquiry-detail__product-name">{inquiry.productName}</p>
                </div>
              )}

              <div className="inquiry-detail__question-content">
                <p className="inquiry-detail__question-label">
                  <svg className="inquiry-detail__question-icon" viewBox="0 0 20 20" fill="none">
                    <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M7 8C7 6.34315 8.34315 5 10 5C11.6569 5 13 6.34315 13 8C13 9.65685 11.6569 11 10 11V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="10" cy="15" r="1" fill="currentColor" />
                  </svg>
                  문의 내용
                </p>
                <p className="inquiry-detail__question-text">{inquiry.question}</p>
              </div>
            </div>

            {inquiry.answer ? (
              <div className="inquiry-detail__answer-section">
                <div className="inquiry-detail__answer-header">
                  <p className="inquiry-detail__answer-label">
                    <svg className="inquiry-detail__answer-icon" viewBox="0 0 20 20" fill="none">
                      <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    답변
                  </p>
                  {inquiry.answeredAt && (
                    <span className="inquiry-detail__answer-date">
                      {formatDate(inquiry.answeredAt)}
                    </span>
                  )}
                </div>
                <div className="inquiry-detail__answer-content">
                  <p className="inquiry-detail__answer-text">{inquiry.answer}</p>
                </div>
              </div>
            ) : (
              <div className="inquiry-detail__no-answer">
                <p className="inquiry-detail__no-answer-text">아직 답변이 등록되지 않았습니다.</p>
                <p className="inquiry-detail__no-answer-sub">영업일 기준 1~2일 이내 답변 예정입니다.</p>
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
