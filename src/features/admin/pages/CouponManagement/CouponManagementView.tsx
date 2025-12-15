import { useState, useRef, useEffect } from 'react';
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
  onViewCoupon: (coupon: AdminCoupon) => void;
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

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="rgba(12, 12, 12, 0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ChevronDownIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`coupon-management__dropdown-arrow ${isOpen ? 'coupon-management__dropdown-arrow--open' : ''}`}
    >
      <path d="M4 6L8 10L12 6" stroke="rgba(12, 12, 12, 0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

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
  onViewCoupon,
  onEditCoupon,
  onToggleStatus,
  onDeleteCoupon,
  getDiscountTypeLabel,
  getDiscountValueLabel,
  getTargetLabel,
  getConditionLabel,
  getPeriodLabel,
}: CouponManagementViewProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = FILTER_OPTIONS.find(opt => opt.value === discountFilter)?.label || '전체 유형';

  const handleOptionSelect = (value: DiscountFilter) => {
    onFilterChange(value);
    setIsDropdownOpen(false);
  };

  return (
    <div className="coupon-management">
      <div className="coupon-management__toolbar">
        <div className="coupon-management__toolbar-left">
          <span className="coupon-management__total">총 쿠폰 수 · {totalCount.toLocaleString()}</span>
        </div>
        <div className="coupon-management__toolbar-right">
          <div className="coupon-management__search">
            <span className="coupon-management__search-icon">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="쿠폰명 검색"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="coupon-management__search-input"
            />
          </div>
          <div className="coupon-management__dropdown" ref={dropdownRef}>
            <button
              type="button"
              className="coupon-management__dropdown-trigger"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="coupon-management__dropdown-text">{selectedLabel}</span>
              <ChevronDownIcon isOpen={isDropdownOpen} />
            </button>
            {isDropdownOpen && (
              <div className="coupon-management__dropdown-menu">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`coupon-management__dropdown-option ${discountFilter === option.value ? 'coupon-management__dropdown-option--selected' : ''}`}
                    onClick={() => handleOptionSelect(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
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
                      className="coupon-table__action-button coupon-table__action-button--view"
                      onClick={() => onViewCoupon(coupon)}
                    >
                      보기
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
