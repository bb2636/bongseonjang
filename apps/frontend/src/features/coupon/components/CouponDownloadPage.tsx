import { Coupon } from '../types/coupon';
import './CouponDownloadPage.css';

interface CouponDownloadPageProps {
  coupons: Coupon[];
  totalCount: number;
  isLoading: boolean;
  isIssuing: boolean;
  onClose: () => void;
  onIssueCoupon: (couponId: string) => void;
}

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const EPOCH_YEAR = 1970;

function isAlwaysAvailable(dateString: string | null | undefined): boolean {
  if (!dateString) return true;
  const date = new Date(dateString);
  return isNaN(date.getTime()) || date.getFullYear() <= EPOCH_YEAR;
}

function formatDate(dateString: string): string {
  if (isAlwaysAvailable(dateString)) {
    return '상시발급';
  }
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}까지`;
}

function isExpiringSoon(dateString: string): boolean {
  if (isAlwaysAvailable(dateString)) {
    return false;
  }
  const expiryDate = new Date(dateString);
  const now = new Date();
  const timeRemaining = expiryDate.getTime() - now.getTime();
  return timeRemaining > 0 && timeRemaining <= TWENTY_FOUR_HOURS_MS;
}

function formatDiscount(coupon: Coupon): string {
  if (coupon.discountType === 'shipping') {
    return '배송비 쿠폰';
  }
  if (coupon.discountType === 'percent') {
    return `${coupon.discountValue}% 할인`;
  }
  return `${coupon.discountValue.toLocaleString()}원 할인`;
}

function formatCondition(coupon: Coupon): string {
  const conditions: string[] = [];
  
  if (coupon.minOrderAmount > 0) {
    conditions.push(`${coupon.minOrderAmount.toLocaleString()}원 이상 주문 시`);
  }
  
  if (coupon.description) {
    conditions.push(coupon.description);
  }
  
  if (conditions.length === 0) {
    return '전 상품 적용 가능';
  }
  
  return conditions.join(' · ');
}

export default function CouponDownloadPage({
  coupons,
  totalCount,
  isLoading,
  isIssuing,
  onClose,
  onIssueCoupon,
}: CouponDownloadPageProps) {
  return (
    <div className="coupon-download-page">
      <header className="coupon-download-page-header">
        <div className="coupon-download-page-header-spacer" />
        <h1 className="coupon-download-page-title">쿠폰 다운로드</h1>
        <button className="coupon-download-page-close" onClick={onClose} aria-label="닫기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="#0C0C0C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>

      <div className="coupon-download-page-summary">
        <span className="coupon-download-page-summary-text">전체 {String(totalCount).padStart(3, '0')}장</span>
      </div>

      <div className="coupon-download-page-content">
        {isLoading ? (
          <div className="coupon-download-page-loading">
            <span className="coupon-download-page-loading-text">쿠폰을 불러오는 중...</span>
          </div>
        ) : coupons.length === 0 ? (
          <div className="coupon-download-page-empty">
            <span className="coupon-download-page-empty-text">발급 가능한 쿠폰이 없습니다</span>
          </div>
        ) : (
          <div className="coupon-download-page-list">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="coupon-download-card">
                <div className="coupon-download-card-content">
                  <div className="coupon-download-card-info">
                    <span className="coupon-download-card-name">{coupon.name}</span>
                    <div className="coupon-download-card-details">
                      <span className="coupon-download-card-discount">{formatDiscount(coupon)}</span>
                      <span className="coupon-download-card-condition">{formatCondition(coupon)}</span>
                    </div>
                  </div>
                  <span className={`coupon-download-card-expiry ${isExpiringSoon(coupon.validTo) ? 'coupon-download-card-expiry--urgent' : ''}`}>
                    {formatDate(coupon.validTo)}
                  </span>
                </div>

                <button
                  className={`coupon-download-card-action ${coupon.isIssued ? 'coupon-download-card-action--issued' : ''}`}
                  onClick={() => !coupon.isIssued && onIssueCoupon(coupon.id)}
                  disabled={coupon.isIssued || isIssuing}
                >
                  {!coupon.isIssued && (
                    <span className="coupon-download-card-action-icon">
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                        <path
                          d="M11 4V14M11 14L6 9M11 14L16 9"
                          stroke="#3B9BD5"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M4 17H18"
                          stroke="#3B9BD5"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  )}
                  <span className="coupon-download-card-action-text">
                    {coupon.isIssued ? '발급완료' : '쿠폰 다운로드'}
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
