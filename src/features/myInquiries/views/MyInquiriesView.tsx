import type { MyInquiry, InquiryType, SortOrder } from "../types/myInquiry";
import { INQUIRY_TYPE_OPTIONS, SORT_OPTIONS } from "../types/myInquiry";
import "./MyInquiriesView.css";

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

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 18L9 12L15 6"
        stroke="#101112"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <path
        d="M8.66667 23.8333C9.5871 23.8333 10.3333 23.0871 10.3333 22.1667C10.3333 21.2462 9.5871 20.5 8.66667 20.5C7.74619 20.5 7 21.2462 7 22.1667C7 23.0871 7.74619 23.8333 8.66667 23.8333Z"
        stroke="rgba(12, 12, 12, 0.9)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.3333 23.8333C20.2538 23.8333 21 23.0871 21 22.1667C21 21.2462 20.2538 20.5 19.3333 20.5C18.4129 20.5 17.6667 21.2462 17.6667 22.1667C17.6667 23.0871 18.4129 23.8333 19.3333 23.8333Z"
        stroke="rgba(12, 12, 12, 0.9)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1 1H5L7.68 15.39C7.77144 15.8504 8.02191 16.264 8.38755 16.5583C8.75318 16.8526 9.2107 17.009 9.68 17H18.4C18.8693 17.009 19.3268 16.8526 19.6925 16.5583C20.0581 16.264 20.3086 15.8504 20.4 15.39L22 6H6"
        stroke="rgba(12, 12, 12, 0.9)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProductPlaceholderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M16.6667 6.66667L10 3.33333L3.33334 6.66667V13.3333L10 16.6667L16.6667 13.3333V6.66667Z"
        stroke="rgba(12, 12, 12, 0.2)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 10V16.6667"
        stroke="rgba(12, 12, 12, 0.2)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 10L16.6667 6.66667"
        stroke="rgba(12, 12, 12, 0.2)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 10L3.33334 6.66667"
        stroke="rgba(12, 12, 12, 0.2)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <path
        d="M42 32V40C42 41.0609 41.5786 42.0783 40.8284 42.8284C40.0783 43.5786 39.0609 44 38 44H10C8.93913 44 7.92172 43.5786 7.17157 42.8284C6.42143 42.0783 6 41.0609 6 40V32"
        stroke="rgba(12, 12, 12, 0.2)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 20L24 32L36 20"
        stroke="rgba(12, 12, 12, 0.2)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 32V4"
        stroke="rgba(12, 12, 12, 0.2)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle
        cx="24"
        cy="24"
        r="20"
        stroke="rgba(12, 12, 12, 0.2)"
        strokeWidth="3"
      />
      <path
        d="M24 16V26"
        stroke="rgba(12, 12, 12, 0.2)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="24" cy="32" r="2" fill="rgba(12, 12, 12, 0.2)" />
    </svg>
  );
}

function InquiryCard({
  inquiry,
  onProductClick,
  isLast,
}: {
  inquiry: MyInquiry;
  onProductClick: (productId: string) => void;
  isLast: boolean;
}) {
  return (
    <>
      <div className="inquiry-card">
        <div className="inquiry-card__header">
          <div className="inquiry-card__meta-row">
            <div className="inquiry-card__meta-left">
              <span
                className={`inquiry-card__status inquiry-card__status--${inquiry.status}`}
              >
                {inquiry.status === "answered" ? "답변완료" : "미답변"}
              </span>
              <span className="inquiry-card__type">
                {inquiry.inquiryTypeLabel}
              </span>
            </div>
            <span className="inquiry-card__date">{inquiry.createdAt}</span>
          </div>

          <div className="inquiry-card__product-section">
            <span className="inquiry-card__product-label">문의상품</span>
            <div className="inquiry-card__product-info">
              {inquiry.productImage ? (
                <img
                  src={inquiry.productImage}
                  alt={inquiry.productName || "상품"}
                  className="inquiry-card__product-image"
                  onClick={() =>
                    inquiry.productId && onProductClick(inquiry.productId)
                  }
                />
              ) : (
                <div className="inquiry-card__product-placeholder">
                  <ProductPlaceholderIcon />
                </div>
              )}
              {inquiry.productName && (
                <span
                  className="inquiry-card__product-name"
                  onClick={() =>
                    inquiry.productId && onProductClick(inquiry.productId)
                  }
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
            <span className="inquiry-card__icon inquiry-card__icon--answer">
              A
            </span>
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
        <button
          className="my-inquiries__header-btn"
          onClick={onBack}
          type="button"
          aria-label="뒤로가기"
        >
          <BackIcon />
        </button>
        <span className="my-inquiries__header-title">상품문의</span>
        <button
          className="my-inquiries__header-btn my-inquiries__cart-btn"
          onClick={onCartClick}
          type="button"
          aria-label="장바구니"
        >
          <CartIcon />
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
                className={`my-inquiries__sort-btn ${sortOrder === option.value ? "my-inquiries__sort-btn--active" : ""}`}
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
            <ErrorIcon />
            <span className="my-inquiries__empty-text">{error}</span>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="my-inquiries__empty">
            <EmptyIcon />
            <span className="my-inquiries__empty-text">
              작성한 문의가 없습니다.
            </span>
          </div>
        ) : (
          <>
            <div className="my-inquiries__count">총 {total}건</div>
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
                {isLoadingMore ? "로딩 중..." : "더보기"}
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
}
