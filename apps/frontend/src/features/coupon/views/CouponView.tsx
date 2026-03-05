import { Coupon } from '../types/coupon';
import './CouponView.css';

interface CouponViewProps {
  coupons: Coupon[];
  totalCount: number;
  isLoading: boolean;
  isIssuing: boolean;
  onBack: () => void;
  onIssueCoupon: (couponId: string) => void;
}

function isAlwaysAvailable(dateString: string | null | undefined): boolean {
  if (!dateString) return true;
  const date = new Date(dateString);
  return isNaN(date.getTime()) || date.getFullYear() <= 1970;
}

function formatDate(dateString: string | null | undefined): string {
  if (isAlwaysAvailable(dateString)) {
    return '상시발급';
  }
  const date = new Date(dateString!);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}까지`;
}

function formatDiscount(coupon: Coupon): string {
  if (coupon.discountType === 'shipping') {
    return '배송비 쿠폰';
  }
  if (coupon.discountType === 'rate') {
    return `${coupon.discountValue}% 할인`;
  }
  return `${coupon.discountValue.toLocaleString()}원 할인`;
}

function formatCondition(coupon: Coupon): string {
  if (coupon.minOrderAmount > 0) {
    return `${coupon.minOrderAmount.toLocaleString()}원 이상 주문 시`;
  }
  if (coupon.description) {
    return coupon.description;
  }
  return '전 상품 적용 가능';
}

export default function CouponView({
  coupons,
  totalCount,
  isLoading,
  isIssuing,
  onBack,
  onIssueCoupon,
}: CouponViewProps) {
  return (
    <div className="coupon-page">
      <header className="coupon-header">
        <button className="coupon-back-button" onClick={onBack} aria-label="뒤로가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="#101112"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="coupon-header-title">쿠폰</h1>
        <div className="coupon-header-spacer" />
      </header>
      <div className="coupon-header-spacer-block" />

      <div className="coupon-summary">
        <span className="coupon-summary-text">전체 {totalCount}장</span>
      </div>

      {isLoading ? (
        <div className="coupon-loading">
          <span className="coupon-loading-text">쿠폰을 불러오는 중...</span>
        </div>
      ) : coupons.length === 0 ? (
        <div className="coupon-empty">
          <span className="coupon-empty-text">발급 가능한 쿠폰이 없습니다</span>
        </div>
      ) : (
        <div className="coupon-list">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className={`coupon-card ${coupon.isIssued ? 'coupon-card--issued' : ''}`}
            >
              <div className="coupon-card-content">
                <div className="coupon-card-info">
                  <span className="coupon-card-name">{coupon.name}</span>
                  <div className="coupon-card-details">
                    <span className="coupon-card-discount">{formatDiscount(coupon)}</span>
                    <span className="coupon-card-condition">{formatCondition(coupon)}</span>
                  </div>
                </div>
                <span className="coupon-card-expiry">{formatDate(coupon.validTo)}</span>
              </div>

              <button
                className={`coupon-card-action ${coupon.isIssued ? 'coupon-card-action--issued' : ''}`}
                onClick={() => !coupon.isIssued && onIssueCoupon(coupon.id)}
                disabled={coupon.isIssued || isIssuing}
              >
                {!coupon.isIssued && (
                  <span className="coupon-card-action-icon">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <path
                        d="M11 3V19M11 19L5 13M11 19L17 13"
                        stroke="#3B9BD5"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
                <span className="coupon-card-action-text">
                  {coupon.isIssued ? '발급완료' : '쿠폰 다운로드'}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
