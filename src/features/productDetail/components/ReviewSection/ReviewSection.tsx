import './ReviewSection.css';

interface ReviewSectionProps {
  reviewCount: number;
  averageRating: number;
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

export default function ReviewSection({ reviewCount, averageRating }: ReviewSectionProps) {
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

      {reviewCount === 0 ? (
        <div className="review-section__empty">
          <p className="review-section__empty-text">아직 작성된 리뷰가 없습니다.</p>
          <p className="review-section__empty-subtext">첫 번째 리뷰를 작성해보세요!</p>
        </div>
      ) : (
        <div className="review-section__list">
          <p className="review-section__placeholder">리뷰 목록이 여기에 표시됩니다.</p>
        </div>
      )}
    </div>
  );
}
