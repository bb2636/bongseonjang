import './SummaryCard.css';

interface SummaryCardProps {
  points: number;
  couponCount: number;
  favoriteCount: number;
  pendingReviewCount: number;
  onPointsClick: () => void;
  onCouponsClick: () => void;
  onFavoritesClick: () => void;
  onPendingReviewsClick: () => void;
}

function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR');
}

export default function SummaryCard({
  points,
  couponCount,
  favoriteCount,
  pendingReviewCount,
  onPointsClick,
  onCouponsClick,
  onFavoritesClick,
  onPendingReviewsClick,
}: SummaryCardProps) {
  return (
    <section className="summary-card">
      <div className="summary-card__stats">
        <button
          type="button"
          className="summary-card__stat-item"
          onClick={onPointsClick}
          aria-label={`포인트 ${formatNumber(points)}P 보기`}
        >
          <div className="summary-card__stat-label">
            <span>포인트</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M3.5 2L6.5 5L3.5 8" stroke="rgba(12, 12, 12, 0.7)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="summary-card__stat-value">{formatNumber(points)}P</span>
        </button>

        <div className="summary-card__divider" />

        <button
          type="button"
          className="summary-card__stat-item"
          onClick={onCouponsClick}
          aria-label={`쿠폰 ${couponCount}장 보기`}
        >
          <div className="summary-card__stat-label">
            <span>쿠폰</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M3.5 2L6.5 5L3.5 8" stroke="rgba(12, 12, 12, 0.7)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="summary-card__stat-value">{couponCount}장</span>
        </button>

        <div className="summary-card__divider" />

        <button
          type="button"
          className="summary-card__stat-item"
          onClick={onFavoritesClick}
          aria-label={`찜 ${favoriteCount}개 보기`}
        >
          <div className="summary-card__stat-label">
            <span>찜</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M3.5 2L6.5 5L3.5 8" stroke="rgba(12, 12, 12, 0.7)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="summary-card__stat-value">{favoriteCount}개</span>
        </button>
      </div>

      <button
        type="button"
        className="summary-card__review-link"
        onClick={onPendingReviewsClick}
        aria-label={`작성 가능한 리뷰 ${pendingReviewCount}개 보기`}
      >
        <span>작성 가능한 리뷰 {pendingReviewCount}개</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M4.5 3L7.5 6L4.5 9" stroke="rgba(12, 12, 12, 0.7)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </section>
  );
}
