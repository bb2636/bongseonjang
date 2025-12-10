import type { Review } from '../../types/productDetail';
import './ReviewSection.css';

interface ReviewSectionProps {
  reviewCount: number;
  averageRating: number;
  reviews: Review[];
  isLoading: boolean;
}

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
}: ReviewSectionProps) {
  const filledStars = Math.round(averageRating);

  return (
    <div className="review-section">
      <div className="review-section__header">
        <h3 className="review-section__title">리뷰</h3>
        <span className="review-section__count">{reviewCount}개</span>
      </div>

      <div className="review-section__summary">
        <div className="review-section__rating">
          <span className="review-section__rating-value">{averageRating.toFixed(1)}</span>
          <div className="review-section__stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon key={star} filled={star <= filledStars} />
            ))}
          </div>
        </div>
      </div>

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
