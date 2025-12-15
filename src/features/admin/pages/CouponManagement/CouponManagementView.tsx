import { AdminCoupon, DiscountFilter } from './useCouponManagement';
import './CouponManagement.css';

interface CouponManagementViewProps {
  coupons: AdminCoupon[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  discountFilter: DiscountFilter;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: DiscountFilter) => void;
  onAddCoupon: () => void;
  onEditCoupon: (coupon: AdminCoupon) => void;
  onToggleStatus: (couponId: number) => void;
  onDeleteCoupon: (couponId: number) => void;
  getDiscountTypeLabel: (type: AdminCoupon['discountType']) => string;
  getDiscountValueLabel: (coupon: AdminCoupon) => string;
  getTargetLabel: (coupon: AdminCoupon) => string;
  getConditionLabel: (coupon: AdminCoupon) => string;
  getPeriodLabel: (coupon: AdminCoupon) => string;
}

const FILTER_OPTIONS: { value: DiscountFilter; label: string }[] = [
  { value: 'all', label: '전체 유형' },
  { value: 'fixed', label: '정액 할인' },
  { value: 'rate', label: '정률 할인' },
  { value: 'shipping', label: '배송비 할인' },
];

export function CouponManagementView({
  coupons,
  totalCount,
  isLoading,
  error,
  searchQuery,
  discountFilter,
  onSearchChange,
  onFilterChange,
  onAddCoupon,
  onEditCoupon,
  onToggleStatus,
  onDeleteCoupon,
  getDiscountTypeLabel,
  getDiscountValueLabel,
  getTargetLabel,
  getConditionLabel,
  getPeriodLabel,
}: CouponManagementViewProps) {
  return (
    <div className="coupon-management">
      <div className="coupon-management__toolbar">
        <div className="coupon-management__toolbar-left">
          <span className="coupon-management__total">총 {totalCount}개</span>
          <div className="coupon-management__search">
            <input
              type="text"
              placeholder="쿠폰명 검색"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="coupon-management__search-input"
            />
          </div>
          <select
            value={discountFilter}
            onChange={(e) => onFilterChange(e.target.value as DiscountFilter)}
            className="coupon-management__filter-select"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="coupon-management__toolbar-right">
          <button className="coupon-management__add-button" onClick={onAddCoupon}>
            새 쿠폰 생성
          </button>
        </div>
      </div>

      {error && (
        <div className="coupon-table__error">
          <p className="coupon-table__error-message">{error}</p>
        </div>
      )}

      {!error && (
        <div className="coupon-table">
          <div className="coupon-table__header">
            <div className="coupon-table__header-row">
              <div className="coupon-table__header-cell coupon-table__header-cell--name">쿠폰명</div>
              <div className="coupon-table__header-cell coupon-table__header-cell--type">유형</div>
              <div className="coupon-table__header-cell coupon-table__header-cell--discount">할인</div>
              <div className="coupon-table__header-cell coupon-table__header-cell--target">적용대상</div>
              <div className="coupon-table__header-cell coupon-table__header-cell--condition">조건</div>
              <div className="coupon-table__header-cell coupon-table__header-cell--period">기간</div>
              <div className="coupon-table__header-cell coupon-table__header-cell--usage">발급/사용</div>
              <div className="coupon-table__header-cell coupon-table__header-cell--status">상태</div>
              <div className="coupon-table__header-cell coupon-table__header-cell--actions">관리</div>
            </div>
          </div>
          <div className="coupon-table__body">
            {isLoading ? (
              <div className="coupon-table__body-row coupon-table__body-row--loading">
                <div className="coupon-table__cell" style={{ flex: 1, textAlign: 'center' }}>
                  로딩 중...
                </div>
              </div>
            ) : coupons.length === 0 ? (
              <div className="coupon-table__empty">
                <p className="coupon-table__empty-message">
                  등록된 쿠폰이 없습니다.
                </p>
              </div>
            ) : (
              coupons.map((coupon) => (
                <div key={coupon.id} className="coupon-table__body-row">
                  <div className="coupon-table__cell coupon-table__cell--name">
                    <span className="coupon-table__name">{coupon.name}</span>
                  </div>
                  <div className="coupon-table__cell coupon-table__cell--type">
                    <span className={`coupon-table__type-badge coupon-table__type-badge--${coupon.discountType}`}>
                      {getDiscountTypeLabel(coupon.discountType)}
                    </span>
                  </div>
                  <div className="coupon-table__cell coupon-table__cell--discount">
                    <span className="coupon-table__discount">{getDiscountValueLabel(coupon)}</span>
                  </div>
                  <div className="coupon-table__cell coupon-table__cell--target">
                    <span className="coupon-table__target">{getTargetLabel(coupon)}</span>
                  </div>
                  <div className="coupon-table__cell coupon-table__cell--condition">
                    <span className="coupon-table__condition">{getConditionLabel(coupon)}</span>
                  </div>
                  <div className="coupon-table__cell coupon-table__cell--period">
                    <span className="coupon-table__period">{getPeriodLabel(coupon)}</span>
                  </div>
                  <div className="coupon-table__cell coupon-table__cell--usage">
                    <span className="coupon-table__usage">{coupon.issuedCount}/{coupon.usedCount}</span>
                  </div>
                  <div className="coupon-table__cell coupon-table__cell--status">
                    <span
                      className={`coupon-table__status ${coupon.isActive ? 'coupon-table__status--active' : 'coupon-table__status--inactive'}`}
                      onClick={() => onToggleStatus(coupon.id)}
                    >
                      {coupon.isActive ? '활성' : '비활성'}
                    </span>
                  </div>
                  <div className="coupon-table__cell coupon-table__cell--actions">
                    <button
                      className="coupon-table__action-button coupon-table__action-button--edit"
                      onClick={() => onEditCoupon(coupon)}
                    >
                      수정
                    </button>
                    <button
                      className="coupon-table__action-button coupon-table__action-button--delete"
                      onClick={() => onDeleteCoupon(coupon.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
