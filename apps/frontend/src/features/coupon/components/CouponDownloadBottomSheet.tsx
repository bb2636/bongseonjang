import type { MouseEvent } from 'react';
import { Coupon } from '../types/coupon';
import './CouponDownloadBottomSheet.css';

interface CouponDownloadBottomSheetProps {
  isOpen: boolean;
  coupons: Coupon[];
  totalCount: number;
  isLoading: boolean;
  isIssuing: boolean;
  onClose: () => void;
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
  if (coupon.discountType === 'percent') {
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

export default function CouponDownloadBottomSheet({
  isOpen,
  coupons,
  totalCount,
  isLoading,
  isIssuing,
  onClose,
  onIssueCoupon,
}: CouponDownloadBottomSheetProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="coupon-bottomsheet-overlay" onClick={handleOverlayClick}>
      <div className="coupon-bottomsheet">
        <header className="coupon-bottomsheet-header">
          <div className="coupon-bottomsheet-header-spacer" />
          <h1 className="coupon-bottomsheet-title">쿠폰 다운로드</h1>
          <button className="coupon-bottomsheet-close" onClick={onClose} aria-label="닫기">
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

        <div className="coupon-bottomsheet-summary">
          <span className="coupon-bottomsheet-summary-text">전체 {String(totalCount).padStart(3, '0')}장</span>
        </div>

        <div className="coupon-bottomsheet-content">
          {isLoading ? (
            <div className="coupon-bottomsheet-loading">
              <span className="coupon-bottomsheet-loading-text">쿠폰을 불러오는 중...</span>
            </div>
          ) : coupons.length === 0 ? (
            <div className="coupon-bottomsheet-empty">
              <span className="coupon-bottomsheet-empty-text">발급 가능한 쿠폰이 없습니다</span>
            </div>
          ) : (
            <div className="coupon-bottomsheet-list">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="coupon-download-card"
                >
                  <div className="coupon-download-card-content">
                    <div className="coupon-download-card-info">
                      <span className="coupon-download-card-name">{coupon.name}</span>
                      <div className="coupon-download-card-details">
                        <span className="coupon-download-card-discount">{formatDiscount(coupon)}</span>
                        <span className="coupon-download-card-condition">{formatCondition(coupon)}</span>
                      </div>
                    </div>
                    <span className="coupon-download-card-expiry">{formatDate(coupon.validTo)}</span>
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
    </div>
  );
}
