import { useState } from 'react';
import type { Review } from '../../types/productDetail';
import './ReviewSection.css';

interface ReviewSectionProps {
  reviewCount: number;
  averageRating: number;
  reviews: Review[];
  isLoading: boolean;
  onViewAllClick?: () => void;
}

const MAX_PHOTO_COUNT = 8;

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 1.33L9.8 5.17L14 5.85L11 8.76L11.78 13.01L8 11.01L4.22 13.01L5 8.76L2 5.85L6.2 5.17L8 1.33Z"
        fill={filled ? '#3B9BD5' : '#D9D9D9'}
      />
    </svg>
  );
}

function extractPhotoUrls(reviews: Review[]): string[] {
  const photoUrls: string[] = [];
  for (const review of reviews) {
    for (const url of review.imageUrls) {
      if (photoUrls.length >= MAX_PHOTO_COUNT) {
        return photoUrls;
      }
      photoUrls.push(url);
    }
  }
  return photoUrls;
}

interface ReviewPhotoGridProps {
  averageRating: number;
  reviewCount: number;
  photoUrls: string[];
  onViewAllClick?: () => void;
}

function ReviewPhotoGrid({ 
  averageRating, 
  reviewCount, 
  photoUrls,
  onViewAllClick 
}: ReviewPhotoGridProps) {
  const filledStars = Math.round(averageRating);
  const placeholderCount = MAX_PHOTO_COUNT - photoUrls.length;

  return (
    <div className="review-photo-grid">
      <div className="review-photo-grid__header">
        <div className="review-photo-grid__rating-info">
          <span className="review-photo-grid__score">{averageRating.toFixed(1)}</span>
          <div className="review-photo-grid__stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon key={star} filled={star <= filledStars} />
            ))}
          </div>
          <span className="review-photo-grid__count">({reviewCount})</span>
        </div>
        <button 
          className="review-photo-grid__view-all" 
          onClick={onViewAllClick}
          type="button"
        >
          전체보기
        </button>
      </div>

      <div className="review-photo-grid__grid">
        {photoUrls.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`리뷰 사진 ${index + 1}`}
            className="review-photo-grid__image"
          />
        ))}
        {Array.from({ length: placeholderCount }).map((_, index) => (
          <div 
            key={`placeholder-${index}`} 
            className="review-photo-grid__placeholder" 
          />
        ))}
      </div>
    </div>
  );
}

function SmallStarIcon({ filled }: { filled: boolean }) {
  return (
    <svg 
      width="12" 
      height="12" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 1.33L9.8 5.17L14 5.85L11 8.76L11.78 13.01L8 11.01L4.22 13.01L5 8.76L2 5.85L6.2 5.17L8 1.33Z"
        fill={filled ? '#3B9BD5' : '#D9D9D9'}
      />
    </svg>
  );
}

function TinyStarIcon() {
  return (
    <svg 
      width="10" 
      height="10" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 1.33L9.8 5.17L14 5.85L11 8.76L11.78 13.01L8 11.01L4.22 13.01L5 8.76L2 5.85L6.2 5.17L8 1.33Z"
        fill="rgba(12, 12, 12, 0.3)"
      />
    </svg>
  );
}

function DropdownArrowIcon() {
  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 20 20" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 8L10 12L14 8"
        stroke="rgba(12, 12, 12, 0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type RatingFilter = 'all' | 1 | 2 | 3 | 4 | 5;

interface ReviewListHeaderProps {
  reviewCount: number;
  selectedFilter: RatingFilter;
  onFilterChange: (filter: RatingFilter) => void;
  onWriteReviewClick?: () => void;
}

function FilterStarIcon({ filled }: { filled: boolean }) {
  return (
    <svg 
      width="10" 
      height="10" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 1.33L9.8 5.17L14 5.85L11 8.76L11.78 13.01L8 11.01L4.22 13.01L5 8.76L2 5.85L6.2 5.17L8 1.33Z"
        fill={filled ? '#3B9BD5' : 'rgba(12, 12, 12, 0.3)'}
      />
    </svg>
  );
}

function ReviewListHeader({ 
  reviewCount, 
  selectedFilter,
  onFilterChange,
  onWriteReviewClick
}: ReviewListHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filterOptions: RatingFilter[] = ['all', 5, 4, 3, 2, 1];

  const handleFilterSelect = (filter: RatingFilter) => {
    onFilterChange(filter);
    setIsDropdownOpen(false);
  };

  const getDisplayStars = () => {
    if (selectedFilter === 'all') {
      return 5;
    }
    return selectedFilter;
  };

  return (
    <div className="review-list-header">
      <div className="review-list-header__title-row">
        <span className="review-list-header__title">후기 {reviewCount}개</span>
        <button 
          className="review-list-header__write-btn" 
          onClick={onWriteReviewClick}
          type="button"
        >
          리뷰남기기
        </button>
      </div>
      <div className="review-list-header__filter-row">
        <div className="review-list-header__filter-wrapper">
          <button 
            className="review-list-header__filter-btn" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            type="button"
          >
            <div className="review-list-header__filter-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <FilterStarIcon key={star} filled={star <= getDisplayStars()} />
              ))}
            </div>
            <DropdownArrowIcon />
          </button>
          {isDropdownOpen && (
            <div className="review-list-header__dropdown">
              {filterOptions.map((option) => (
                <button
                  key={option}
                  className={`review-list-header__dropdown-item ${selectedFilter === option ? 'review-list-header__dropdown-item--active' : ''}`}
                  onClick={() => handleFilterSelect(option)}
                  type="button"
                >
                  {option === 'all' ? (
                    '전체'
                  ) : (
                    <div className="review-list-header__dropdown-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FilterStarIcon key={star} filled={star <= option} />
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

function ReviewItem({ review }: { review: Review }) {
  const filledStars = Math.round(review.rating);

  return (
    <div className="review-item">
      <div className="review-item__top">
        <div className="review-item__user-info">
          <span className="review-item__user-name">{review.userName}</span>
          <div className="review-item__rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <SmallStarIcon key={star} filled={star <= filledStars} />
            ))}
          </div>
        </div>
      </div>

      <div className="review-item__body">
        {review.imageUrls.length > 0 && (
          <img
            src={review.imageUrls[0]}
            alt="리뷰 이미지"
            className="review-item__image"
          />
        )}
        <p className="review-item__content">{review.content}</p>
      </div>

      <span className="review-item__date">{formatDate(review.createdAt)}</span>
    </div>
  );
}

export default function ReviewSection({ 
  reviewCount, 
  averageRating,
  reviews,
  isLoading,
  onViewAllClick,
}: ReviewSectionProps) {
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const photoUrls = extractPhotoUrls(reviews);

  const filteredReviews = ratingFilter === 'all' 
    ? reviews 
    : reviews.filter((review) => Math.round(review.rating) === ratingFilter);

  return (
    <div className="review-section">
      <ReviewPhotoGrid
        averageRating={averageRating}
        reviewCount={reviewCount}
        photoUrls={photoUrls}
        onViewAllClick={onViewAllClick}
      />

      <div className="review-section__divider" />

      <ReviewListHeader 
        reviewCount={reviewCount} 
        selectedFilter={ratingFilter}
        onFilterChange={setRatingFilter}
      />

      {isLoading ? (
        <div className="review-section__loading">
          <div className="review-section__spinner" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="review-section__empty">
          <p className="review-section__empty-text">
            {ratingFilter === 'all' ? '아직 작성된 리뷰가 없습니다.' : `${ratingFilter}점 리뷰가 없습니다.`}
          </p>
          <p className="review-section__empty-subtext">
            {ratingFilter === 'all' ? '첫 번째 리뷰를 작성해보세요!' : '다른 별점을 선택해보세요.'}
          </p>
        </div>
      ) : (
        <div className="review-section__list">
          {filteredReviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
