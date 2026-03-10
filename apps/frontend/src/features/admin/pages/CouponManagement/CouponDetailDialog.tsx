import { AdminCoupon } from './useCouponManagement';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import './CouponDetailDialog.css';

interface CouponDetailDialogProps {
  isOpen: boolean;
  coupon: AdminCoupon | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  getDiscountTypeLabel: (type: AdminCoupon['discountType']) => string;
  getDiscountValueLabel: (coupon: AdminCoupon) => string;
  getTargetLabel: (coupon: AdminCoupon) => string;
  getConditionLabel: (coupon: AdminCoupon) => string;
  getPeriodLabel: (coupon: AdminCoupon) => string;
}

export function CouponDetailDialog({
  isOpen,
  coupon,
  onClose,
  onEdit,
  onDelete,
  getDiscountTypeLabel,
  getDiscountValueLabel,
  getTargetLabel,
  getConditionLabel,
  getPeriodLabel,
}: CouponDetailDialogProps) {
  useBodyScrollLock(isOpen);
  if (!isOpen || !coupon) return null;

  return (
    <div className="coupon-detail-dialog__overlay" onClick={onClose}>
      <div className="coupon-detail-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="coupon-detail-dialog__header">
          <h2 className="coupon-detail-dialog__title">쿠폰 상세</h2>
          <button className="coupon-detail-dialog__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="coupon-detail-dialog__content">
          <div className="coupon-detail-dialog__row">
            <span className="coupon-detail-dialog__label">쿠폰명</span>
            <span className="coupon-detail-dialog__value">{coupon.name}</span>
          </div>

          {coupon.description && (
            <div className="coupon-detail-dialog__row">
              <span className="coupon-detail-dialog__label">설명</span>
              <span className="coupon-detail-dialog__value">{coupon.description}</span>
            </div>
          )}

          <div className="coupon-detail-dialog__row">
            <span className="coupon-detail-dialog__label">할인 유형</span>
            <span className="coupon-detail-dialog__value">
              <span className={`coupon-detail-dialog__badge coupon-detail-dialog__badge--${coupon.discountType}`}>
                {getDiscountTypeLabel(coupon.discountType)}
              </span>
            </span>
          </div>

          <div className="coupon-detail-dialog__row">
            <span className="coupon-detail-dialog__label">할인 금액</span>
            <span className="coupon-detail-dialog__value">{getDiscountValueLabel(coupon)}</span>
          </div>

          <div className="coupon-detail-dialog__row">
            <span className="coupon-detail-dialog__label">적용 대상</span>
            <span className="coupon-detail-dialog__value">{getTargetLabel(coupon)}</span>
          </div>

          <div className="coupon-detail-dialog__row">
            <span className="coupon-detail-dialog__label">사용 조건</span>
            <span className="coupon-detail-dialog__value">{getConditionLabel(coupon)}</span>
          </div>

          <div className="coupon-detail-dialog__row">
            <span className="coupon-detail-dialog__label">유효 기간</span>
            <span className="coupon-detail-dialog__value">{getPeriodLabel(coupon)}</span>
          </div>

          <div className="coupon-detail-dialog__row">
            <span className="coupon-detail-dialog__label">발급/사용</span>
            <span className="coupon-detail-dialog__value">{coupon.issuedCount} / {coupon.usedCount}</span>
          </div>

          <div className="coupon-detail-dialog__row">
            <span className="coupon-detail-dialog__label">상태</span>
            <span className="coupon-detail-dialog__value">
              <span className={`coupon-detail-dialog__status ${coupon.isActive ? 'coupon-detail-dialog__status--active' : 'coupon-detail-dialog__status--inactive'}`}>
                {coupon.isActive ? '활성' : '비활성'}
              </span>
            </span>
          </div>

          <div className="coupon-detail-dialog__row">
            <span className="coupon-detail-dialog__label">생성일</span>
            <span className="coupon-detail-dialog__value">
              {new Date(coupon.createdAt).toLocaleDateString('ko-KR')}
            </span>
          </div>
        </div>

        <div className="coupon-detail-dialog__actions">
          <button
            type="button"
            className="coupon-detail-dialog__button coupon-detail-dialog__button--delete"
            onClick={onDelete}
          >
            삭제
          </button>
          <button
            type="button"
            className="coupon-detail-dialog__button coupon-detail-dialog__button--edit"
            onClick={onEdit}
          >
            수정
          </button>
        </div>
      </div>
    </div>
  );
}
