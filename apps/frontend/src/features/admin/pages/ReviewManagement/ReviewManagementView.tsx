import { AdminReview } from './useReviewManagement';
import './ReviewManagement.css';

interface ReviewManagementViewProps {
  reviews: AdminReview[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  ratingFilter: string;
  onSearchChange: (query: string) => void;
  onRatingFilterChange: (rating: string) => void;
  onViewReview: (review: AdminReview) => void;
  onDeleteReview: (reviewId: string) => void;
  formatDate: (dateString: string) => string;
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function renderStars(rating: number) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={i <= rating ? 'review-table__star review-table__star--filled' : 'review-table__star'}>★</span>
    );
  }
  return stars;
}

export function ReviewManagementView({
  reviews,
  totalCount,
  isLoading,
  error,
  searchQuery,
  ratingFilter,
  onSearchChange,
  onRatingFilterChange,
  onViewReview,
  onDeleteReview,
  formatDate,
}: ReviewManagementViewProps) {
  return (
    <div className="review-management">
      <div className="review-management__toolbar">
        <div className="review-management__toolbar-left">
          <span className="review-management__total">총 리뷰 수</span>
          <span className="review-management__total-dot">·</span>
          <span className="review-management__total-count">{totalCount.toLocaleString()}</span>
        </div>
        <div className="review-management__toolbar-right">
          <select
            className="review-management__rating-filter"
            value={ratingFilter}
            onChange={(e) => onRatingFilterChange(e.target.value)}
          >
            <option value="all">전체 별점</option>
            <option value="5">★★★★★ (5)</option>
            <option value="4">★★★★☆ (4)</option>
            <option value="3">★★★☆☆ (3)</option>
            <option value="2">★★☆☆☆ (2)</option>
            <option value="1">★☆☆☆☆ (1)</option>
          </select>
          <div className="review-management__search">
            <span className="review-management__search-icon">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="상품명, 작성자, 내용으로 검색하세요"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="review-management__search-input"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="review-table__error">
          <p className="review-table__error-message">{error}</p>
        </div>
      )}

      {!error && (
        <div className="review-table">
          <div className="review-table__header">
            <div className="review-table__header-row">
              <div className="review-table__header-cell review-table__header-cell--product">상품</div>
              <div className="review-table__header-cell review-table__header-cell--author">작성자</div>
              <div className="review-table__header-cell review-table__header-cell--rating">별점</div>
              <div className="review-table__header-cell review-table__header-cell--content">내용</div>
              <div className="review-table__header-cell review-table__header-cell--date">작성일</div>
              <div className="review-table__header-cell review-table__header-cell--actions">관리</div>
            </div>
          </div>
          <div className="review-table__body">
            {isLoading ? (
              <div className="review-table__body-row review-table__body-row--loading">
                <div className="review-table__cell" style={{ flex: 1, textAlign: 'center' }}>
                  로딩 중...
                </div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="review-table__empty">
                <p className="review-table__empty-message">
                  등록된 리뷰가 없습니다.
                </p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="review-table__body-row">
                  <div className="review-table__cell review-table__cell--product">
                    {review.productThumbnail ? (
                      <img
                        src={review.productThumbnail}
                        alt={review.productName || ''}
                        className="review-table__product-thumbnail"
                      />
                    ) : (
                      <div className="review-table__product-thumbnail review-table__product-thumbnail--placeholder" />
                    )}
                    <span className="review-table__product-name">{review.productName || '-'}</span>
                  </div>
                  <div className="review-table__cell review-table__cell--author">
                    <span className="review-table__author">{review.userName || '-'}</span>
                  </div>
                  <div className="review-table__cell review-table__cell--rating">
                    <span className="review-table__rating">{renderStars(review.rating)}</span>
                  </div>
                  <div className="review-table__cell review-table__cell--content">
                    <span className="review-table__content">
                      {review.content.length > 50 ? review.content.substring(0, 50) + '...' : review.content}
                    </span>
                  </div>
                  <div className="review-table__cell review-table__cell--date">
                    <span className="review-table__date">{formatDate(review.createdAt)}</span>
                  </div>
                  <div className="review-table__cell review-table__cell--actions">
                    <button
                      className="review-table__action-button"
                      onClick={() => onViewReview(review)}
                    >
                      보기
                    </button>
                    <button
                      className="review-table__action-button review-table__action-button--delete"
                      onClick={() => onDeleteReview(review.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
