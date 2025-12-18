import type { MyInquiry, InquiryType, SortOrder } from '../types/myInquiry';
import { INQUIRY_TYPE_OPTIONS, SORT_OPTIONS } from '../types/myInquiry';
import './MyInquiriesView.css';

interface MyInquiriesViewProps {
  inquiries: MyInquiry[];
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  selectedType: InquiryType;
  sortOrder: SortOrder;
  onBack: () => void;
  onCartClick: () => void;
  onTypeChange: (type: InquiryType) => void;
  onSortChange: (sort: SortOrder) => void;
  onProductClick: (productId: string) => void;
  onLoadMore: () => void;
}

function InquiryCard({ inquiry, onProductClick, isLast }: { inquiry: MyInquiry; onProductClick: (productId: string) => void; isLast: boolean }) {
  return (
    <>
      <div className="inquiry-card">
        <div className="inquiry-card__header">
          <div className="inquiry-card__meta-row">
            <div className="inquiry-card__meta-left">
              <span className={`inquiry-card__status inquiry-card__status--${inquiry.status}`}>
                {inquiry.status === 'answered' ? '답변완료' : '미답변'}
              </span>
              <span className="inquiry-card__type">{inquiry.inquiryTypeLabel}</span>
            </div>
            <span className="inquiry-card__date">{inquiry.createdAt}</span>
          </div>

          <div className="inquiry-card__product-section">
            <span className="inquiry-card__product-label">문의상품</span>
            <div className="inquiry-card__product-info">
              {inquiry.productImage ? (
                <img
                  src={inquiry.productImage}
                  alt={inquiry.productName || '상품'}
                  className="inquiry-card__product-image"
                  onClick={() => inquiry.productId && onProductClick(inquiry.productId)}
                />
              ) : (
                <div className="inquiry-card__product-placeholder">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
              )}
              {inquiry.productName && (
                <span
                  className="inquiry-card__product-name"
                  onClick={() => inquiry.productId && onProductClick(inquiry.productId)}
                >
                  {inquiry.productName}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="inquiry-card__content">
          <span className="inquiry-card__icon">Q</span>
          <p className="inquiry-card__text">{inquiry.question}</p>
        </div>

        {inquiry.answer && (
          <div className="inquiry-card__answer">
            <span className="inquiry-card__icon inquiry-card__icon--answer">A</span>
            <p className="inquiry-card__text">{inquiry.answer}</p>
          </div>
        )}
      </div>
      {!isLast && <div className="inquiry-card__divider" />}
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="my-inquiries__loading">
      {[1, 2, 3].map((i) => (
        <div key={i} className="my-inquiries__skeleton">
          <div className="my-inquiries__skeleton-meta">
            <div className="my-inquiries__skeleton-badge" />
            <div className="my-inquiries__skeleton-type" />
          </div>
          <div className="my-inquiries__skeleton-product">
            <div className="my-inquiries__skeleton-image" />
            <div className="my-inquiries__skeleton-content">
              <div className="my-inquiries__skeleton-line my-inquiries__skeleton-line--medium" />
            </div>
          </div>
          <div className="my-inquiries__skeleton-line" />
        </div>
      ))}
    </div>
  );
}

export default function MyInquiriesView({
  inquiries,
  total,
  hasMore,
  isLoading,
  isLoadingMore,
  error,
  selectedType,
  sortOrder,
  onBack,
  onCartClick,
  onTypeChange,
  onSortChange,
  onProductClick,
  onLoadMore,
}: MyInquiriesViewProps) {
  return (
    <div className="my-inquiries">
      <header className="my-inquiries__header">
        <button className="my-inquiries__header-btn" onClick={onBack} type="button">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <span className="my-inquiries__header-title">상품문의</span>
        <button className="my-inquiries__header-btn my-inquiries__cart-btn" onClick={onCartClick} type="button">
          <span className="material-symbols-outlined">local_mall</span>
        </button>
      </header>

      <main className="my-inquiries__content">
        <div className="my-inquiries__filters">
          <select
            className="my-inquiries__type-select"
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value as InquiryType)}
          >
            {INQUIRY_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="my-inquiries__sort-buttons">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`my-inquiries__sort-btn ${sortOrder === option.value ? 'my-inquiries__sort-btn--active' : ''}`}
                onClick={() => onSortChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="my-inquiries__empty">
            <span className="my-inquiries__empty-icon material-symbols-outlined">error</span>
            <span className="my-inquiries__empty-text">{error}</span>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="my-inquiries__empty">
            <span className="my-inquiries__empty-icon material-symbols-outlined">chat_bubble</span>
            <span className="my-inquiries__empty-text">작성한 문의가 없습니다.</span>
          </div>
        ) : (
          <>
            <div className="my-inquiries__count">
              총 {total}건
            </div>
            <div className="my-inquiries__list">
              {inquiries.map((inquiry, index) => (
                <InquiryCard 
                  key={inquiry.id} 
                  inquiry={inquiry} 
                  onProductClick={onProductClick} 
                  isLast={index === inquiries.length - 1}
                />
              ))}
            </div>
            {hasMore && (
              <button
                type="button"
                className="my-inquiries__load-more"
                onClick={onLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? '로딩 중...' : '더보기'}
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
}
