import { useState } from "react";
import type { MyInquiry, InquiryType, SortOrder } from "../types/myInquiry";
import { INQUIRY_TYPE_OPTIONS, SORT_OPTIONS } from "../types/myInquiry";
import AppBar, { AppBarSpacer } from "../../../components/AppBar/AppBar";
import "./MyInquiriesView.css";

import { useMyInquiriesPage } from '../hooks/useMyInquiriesPage';

type MyInquiriesPageReturn = ReturnType<typeof useMyInquiriesPage>;

interface MyInquiriesViewProps {
  state: MyInquiriesPageReturn['state'];
  actions: MyInquiriesPageReturn['actions'];
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
  onImageClick,
}: {
  inquiry: MyInquiry;
  onProductClick: (productId: string) => void;
  isLast: boolean;
  onImageClick: (imageUrl: string) => void;
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
          <div className="inquiry-card__content-body">
            <p className="inquiry-card__title">{inquiry.title}</p>
            <p className="inquiry-card__text">{inquiry.question}</p>
            {inquiry.imageUrls && inquiry.imageUrls.length > 0 && (
              <div className="inquiry-card__images">
                {inquiry.imageUrls.map((imageUrl, index) => (
                  <img
                    key={index}
                    src={imageUrl}
                    alt={`문의 이미지 ${index + 1}`}
                    className="inquiry-card__inquiry-image"
                    onClick={() => onImageClick(imageUrl)}
                  />
                ))}
              </div>
            )}
          </div>
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

export default function MyInquiriesView({ state, actions }: MyInquiriesViewProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  const {
    inquiries,
    total,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    selectedType,
    sortOrder,
  } = state;
  const {
    onBack,
    onCartClick,
    onTypeChange,
    onSortChange,
    onProductClick,
    onLoadMore,
  } = actions;

  const handleImageClick = (imageUrl: string) => {
    setLightboxImage(imageUrl);
  };

  const handleCloseLightbox = () => {
    setLightboxImage(null);
  };

  return (
    <div className="my-inquiries">
      <AppBar
        variant="subpage"
        title="상품문의"
        onBackClick={onBack}
        showCart
        onCartClick={onCartClick}
      />
      <AppBarSpacer variant="subpage" />

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
                  onImageClick={handleImageClick}
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

      {lightboxImage && (
        <div className="inquiry-lightbox" onClick={handleCloseLightbox}>
          <button 
            type="button"
            className="inquiry-lightbox__close"
            onClick={handleCloseLightbox}
          >
            &times;
          </button>
          <img
            src={lightboxImage}
            alt="확대 이미지"
            className="inquiry-lightbox__image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
