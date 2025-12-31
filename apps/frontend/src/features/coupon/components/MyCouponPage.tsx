import { Coupon } from '../types/coupon';
import './MyCouponPage.css';

interface MyCouponPageProps {
  coupons: Coupon[];
  totalCount: number;
  isLoading: boolean;
  onBack: () => void;
  onGoToDownload: () => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}까지`;
}

function formatDiscount(coupon: Coupon): string {
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

export default function MyCouponPage({
  coupons,
  totalCount,
  isLoading,
  onBack,
  onGoToDownload,
}: MyCouponPageProps) {
  return (
    <div className="my-coupon-page">
      <header className="my-coupon-page-header">
        <button className="my-coupon-page-back" onClick={onBack} aria-label="뒤로가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="#0C0C0C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="my-coupon-page-title">쿠폰</h1>
        <button className="my-coupon-page-download-btn" onClick={onGoToDownload}>
          쿠폰 다운로드
        </button>
      </header>

      <div className="my-coupon-page-summary">
        <span className="my-coupon-page-summary-text">전체 {String(totalCount).padStart(3, '0')}장</span>
      </div>

      <div className="my-coupon-page-content">
        {isLoading ? (
          <div className="my-coupon-page-loading">
            <span className="my-coupon-page-loading-text">쿠폰을 불러오는 중...</span>
          </div>
        ) : coupons.length === 0 ? (
          <div className="my-coupon-page-empty">
            <span className="my-coupon-page-empty-text">보유한 쿠폰이 없습니다</span>
          </div>
        ) : (
          <div className="my-coupon-page-list">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="my-coupon-card">
                <div className="my-coupon-card-content">
                  <div className="my-coupon-card-info">
                    <span className="my-coupon-card-name">{coupon.name}</span>
                    <div className="my-coupon-card-details">
                      <span className="my-coupon-card-discount">{formatDiscount(coupon)}</span>
                      <span className="my-coupon-card-condition">{formatCondition(coupon)}</span>
                    </div>
                  </div>
                  <span className="my-coupon-card-expiry">{formatDate(coupon.validTo)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
