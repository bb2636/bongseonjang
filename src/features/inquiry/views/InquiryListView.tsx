import { AppBar } from '../../../components';
import { INQUIRY_TYPE_LABELS } from '../types/inquiry';
import type { InquiryListPageState } from '../hooks/useInquiryListPage';
import './InquiryListView.css';

interface InquiryListViewProps {
  state: InquiryListPageState;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export default function InquiryListView({ state }: InquiryListViewProps) {
  const {
    inquiries,
    isLoading,
    error,
    handleBack,
    handleCartClick,
    handleWriteClick,
    handleInquiryClick,
  } = state;

  return (
    <div className="inquiry-list-page">
      <AppBar
        title="1:1문의"
        showBackButton
        onBackClick={handleBack}
        showCart
        onCartClick={handleCartClick}
      />

      <main className="inquiry-list-page__content">
        <div className="inquiry-list-page__header">
          <span className="inquiry-list-page__count">
            총 {inquiries.length}건
          </span>
          <button
            type="button"
            className="inquiry-list-page__write-btn"
            onClick={handleWriteClick}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            문의하기
          </button>
        </div>

        {isLoading ? (
          <div className="inquiry-list-page__loading">로딩 중...</div>
        ) : error ? (
          <div className="inquiry-list-page__error">{error}</div>
        ) : inquiries.length === 0 ? (
          <div className="inquiry-list__empty">
            <svg className="inquiry-list__empty-icon" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" />
              <path d="M32 20V36M32 44H32.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="inquiry-list__empty-text">등록된 문의가 없습니다.</p>
            <button
              type="button"
              className="inquiry-list__empty-btn"
              onClick={handleWriteClick}
            >
              문의하기
            </button>
          </div>
        ) : (
          <ul className="inquiry-list">
            {inquiries.map((inquiry) => (
              <li key={inquiry.id} className="inquiry-list__item">
                <button
                  type="button"
                  className="inquiry-list__item-button"
                  onClick={() => handleInquiryClick(inquiry.id)}
                >
                  <div className="inquiry-list__item-header">
                    <span className="inquiry-list__type">
                      {INQUIRY_TYPE_LABELS[inquiry.inquiryType]}
                    </span>
                    <span
                      className={`inquiry-list__status ${
                        inquiry.isAnswered
                          ? 'inquiry-list__status--answered'
                          : 'inquiry-list__status--pending'
                      }`}
                    >
                      {inquiry.isAnswered ? '답변완료' : '답변대기'}
                    </span>
                  </div>
                  {inquiry.productName && (
                    <p className="inquiry-list__product">{inquiry.productName}</p>
                  )}
                  <p className="inquiry-list__question">{inquiry.question}</p>
                  <span className="inquiry-list__date">{formatDate(inquiry.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
