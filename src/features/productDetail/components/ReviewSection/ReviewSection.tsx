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
      <div className="review-item__header">
        <div className="review-item__user-info">
          <span className="review-item__user-name">{review.userName}</span>
          {review.isVerifiedPurchase && (
            <span className="review-item__verified-badge">구매인증</span>
          )}
        </div>
        <span className="review-item__date">{formatDate(review.createdAt)}</span>
      </div>

      <div className="review-item__rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <SmallStarIcon key={star} filled={star <= filledStars} />
        ))}
      </div>

      <p className="review-item__content">{review.content}</p>

      {review.imageUrls.length > 0 && (
        <div className="review-item__images">
          {review.imageUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`리뷰 이미지 ${index + 1}`}
              className="review-item__image"
            />
          ))}
        </div>
      )}
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
  const photoUrls = extractPhotoUrls(reviews);

  return (
    <div className="review-section">
      <ReviewPhotoGrid
        averageRating={averageRating}
        reviewCount={reviewCount}
        photoUrls={photoUrls}
        onViewAllClick={onViewAllClick}
      />

      <div className="review-section__divider" />

      {isLoading ? (
        <div className="review-section__loading">
          <div className="review-section__spinner" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="review-section__empty">
          <p className="review-section__empty-text">아직 작성된 리뷰가 없습니다.</p>
          <p className="review-section__empty-subtext">첫 번째 리뷰를 작성해보세요!</p>
        </div>
      ) : (
        <div className="review-section__list">
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
