import { useState, useEffect } from 'react';
import { AdminCoupon, DiscountType } from './useCouponManagement';
import { DateRangePicker } from '../../../../components/DateRangePicker';
import './CouponFormDialog.css';

interface CouponFormDialogProps {
  isOpen: boolean;
  coupon: AdminCoupon | null;
  onClose: () => void;
  onSuccess: () => void;
}

type ValidityType = 'fixed' | 'afterIssue';
type TargetType = 'all' | 'category';
type IssueType = 'all' | 'new';

interface Category {
  id: string;
  name: string;
}

interface CouponFormData {
  name: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount: number;
  minOrderAmount: number;
  targetType: TargetType;
  targetCategories: string[];
  issueType: IssueType;
  validityType: ValidityType;
  validFrom: string;
  validTo: string;
  validDays: number;
  isActive: boolean;
}

const INITIAL_FORM_DATA: CouponFormData = {
  name: '',
  description: '',
  discountType: 'fixed',
  discountValue: 0,
  maxDiscountAmount: 0,
  minOrderAmount: 0,
  targetType: 'all',
  targetCategories: [],
  issueType: 'all',
  validityType: 'fixed',
  validFrom: '',
  validTo: '',
  validDays: 30,
  isActive: true,
};

export function CouponFormDialog({ isOpen, coupon, onClose, onSuccess }: CouponFormDialogProps) {
  const [formData, setFormData] = useState<CouponFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);

  const isEditing = !!coupon;

  useEffect(() => {
    if (isOpen) {
      setIsCategoriesLoading(true);
      fetch('/api/products/categories')
        .then((res) => res.json())
        .then((data) => {
          setCategories(data);
        })
        .catch((err) => {
          console.error('Failed to fetch categories:', err);
        })
        .finally(() => {
          setIsCategoriesLoading(false);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (coupon) {
      setFormData({
        name: coupon.name,
        description: coupon.description || '',
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscountAmount: coupon.maxDiscountAmount || 0,
        minOrderAmount: coupon.minOrderAmount,
        targetType: coupon.targetType,
        targetCategories: coupon.targetCategories || [],
        issueType: coupon.issueType === 'grade' ? 'all' : coupon.issueType,
        validityType: coupon.validityType === 'unlimited' ? 'fixed' : coupon.validityType,
        validFrom: coupon.validFrom ? coupon.validFrom.split('T')[0] : '',
        validTo: coupon.validTo ? coupon.validTo.split('T')[0] : '',
        validDays: coupon.validDays || 30,
        isActive: coupon.isActive,
      });
    } else {
      setFormData(INITIAL_FORM_DATA);
    }
    setError(null);
  }, [coupon, isOpen]);

  const handleChange = (field: keyof CouponFormData, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => {
      const newCategories = prev.targetCategories.includes(categoryId)
        ? prev.targetCategories.filter(id => id !== categoryId)
        : [...prev.targetCategories, categoryId];
      return { ...prev, targetCategories: newCategories };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (formData.validityType === 'fixed' && (!formData.validFrom || !formData.validTo)) {
      setError('기간 지정 시 시작일과 종료일을 모두 선택해주세요.');
      setIsSubmitting(false);
      return;
    }

    if (formData.targetType === 'category' && formData.targetCategories.length === 0) {
      setError('특정 카테고리를 선택해주세요.');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        maxDiscountAmount: formData.discountType === 'rate' ? formData.maxDiscountAmount : undefined,
        minOrderAmount: formData.minOrderAmount,
        targetType: formData.targetType,
        targetCategories: formData.targetType === 'category' ? formData.targetCategories : undefined,
        issueType: formData.issueType,
        validityType: formData.validityType,
        validFrom: formData.validityType === 'fixed' && formData.validFrom ? new Date(formData.validFrom) : undefined,
        validTo: formData.validityType === 'fixed' && formData.validTo ? new Date(formData.validTo) : undefined,
        validDays: formData.validityType === 'afterIssue' ? formData.validDays : undefined,
        isActive: formData.isActive,
      };

      const url = isEditing ? `/api/admin/coupons/${coupon.id}` : '/api/admin/coupons';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '쿠폰 저장에 실패했습니다');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="coupon-form-dialog__overlay" onClick={onClose}>
      <div className="coupon-form-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="coupon-form-dialog__header">
          <h2 className="coupon-form-dialog__title">
            {isEditing ? '쿠폰 수정' : '새 쿠폰 생성'}
          </h2>
          <button className="coupon-form-dialog__close" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="coupon-form-dialog__form" onSubmit={handleSubmit}>
          {error && (
            <div className="coupon-form-dialog__error">
              {error}
            </div>
          )}

          <div className="coupon-form-dialog__section">
            <h3 className="coupon-form-dialog__section-title">기본 정보</h3>
            
            <div className="coupon-form-dialog__field">
              <label className="coupon-form-dialog__label">쿠폰명 *</label>
              <input
                type="text"
                className="coupon-form-dialog__input"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="예: 첫 주문 5,000원 할인"
                required
              />
            </div>

            <div className="coupon-form-dialog__field">
              <label className="coupon-form-dialog__label">설명</label>
              <textarea
                className="coupon-form-dialog__textarea"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="쿠폰에 대한 설명을 입력하세요"
                rows={2}
              />
            </div>
          </div>

          <div className="coupon-form-dialog__section">
            <h3 className="coupon-form-dialog__section-title">할인 설정</h3>
            
            <div className="coupon-form-dialog__field">
              <label className="coupon-form-dialog__label">할인 유형 *</label>
              <div className="coupon-form-dialog__radio-group">
                <label className="coupon-form-dialog__radio">
                  <input
                    type="radio"
                    name="discountType"
                    value="fixed"
                    checked={formData.discountType === 'fixed'}
                    onChange={() => handleChange('discountType', 'fixed')}
                  />
                  <span className="coupon-form-dialog__radio-custom"></span>
                  <span className="coupon-form-dialog__radio-label">정액 할인</span>
                </label>
                <label className="coupon-form-dialog__radio">
                  <input
                    type="radio"
                    name="discountType"
                    value="rate"
                    checked={formData.discountType === 'rate'}
                    onChange={() => handleChange('discountType', 'rate')}
                  />
                  <span className="coupon-form-dialog__radio-custom"></span>
                  <span className="coupon-form-dialog__radio-label">정률 할인</span>
                </label>
                <label className="coupon-form-dialog__radio">
                  <input
                    type="radio"
                    name="discountType"
                    value="shipping"
                    checked={formData.discountType === 'shipping'}
                    onChange={() => handleChange('discountType', 'shipping')}
                  />
                  <span className="coupon-form-dialog__radio-custom"></span>
                  <span className="coupon-form-dialog__radio-label">배송비 할인</span>
                </label>
              </div>
            </div>

            <div className="coupon-form-dialog__field-row">
              <div className="coupon-form-dialog__field">
                <label className="coupon-form-dialog__label">
                  {formData.discountType === 'rate' ? '할인율 (%) *' : '할인금액 (원) *'}
                </label>
                <input
                  type="number"
                  className="coupon-form-dialog__input"
                  value={formData.discountValue}
                  onChange={(e) => handleChange('discountValue', parseInt(e.target.value) || 0)}
                  min={0}
                  max={formData.discountType === 'rate' ? 100 : undefined}
                  required
                />
              </div>

              {formData.discountType === 'rate' && (
                <div className="coupon-form-dialog__field">
                  <label className="coupon-form-dialog__label">최대 할인금액 (원)</label>
                  <input
                    type="number"
                    className="coupon-form-dialog__input"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => handleChange('maxDiscountAmount', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
              )}
            </div>

            <div className="coupon-form-dialog__field">
              <label className="coupon-form-dialog__label">최소 주문금액 (원)</label>
              <input
                type="number"
                className="coupon-form-dialog__input"
                value={formData.minOrderAmount}
                onChange={(e) => handleChange('minOrderAmount', parseInt(e.target.value) || 0)}
                min={0}
                placeholder="0원이면 조건 없음"
              />
            </div>
          </div>

          <div className="coupon-form-dialog__section">
            <h3 className="coupon-form-dialog__section-title">적용 대상</h3>
            
            <div className="coupon-form-dialog__field">
              <label className="coupon-form-dialog__label">적용 대상 *</label>
              <div className="coupon-form-dialog__radio-group">
                <label className="coupon-form-dialog__radio">
                  <input
                    type="radio"
                    name="targetType"
                    value="all"
                    checked={formData.targetType === 'all'}
                    onChange={() => handleChange('targetType', 'all')}
                  />
                  <span className="coupon-form-dialog__radio-custom"></span>
                  <span className="coupon-form-dialog__radio-label">전체 상품</span>
                </label>
                <label className="coupon-form-dialog__radio">
                  <input
                    type="radio"
                    name="targetType"
                    value="category"
                    checked={formData.targetType === 'category'}
                    onChange={() => handleChange('targetType', 'category')}
                  />
                  <span className="coupon-form-dialog__radio-custom"></span>
                  <span className="coupon-form-dialog__radio-label">특정 카테고리</span>
                </label>
              </div>
            </div>

            {formData.targetType === 'category' && (
              <div className="coupon-form-dialog__field">
                <label className="coupon-form-dialog__label">카테고리 선택 *</label>
                {isCategoriesLoading ? (
                  <div className="coupon-form-dialog__category-loading">카테고리 로딩 중...</div>
                ) : categories.length === 0 ? (
                  <div className="coupon-form-dialog__category-empty">등록된 카테고리가 없습니다</div>
                ) : (
                  <div className="coupon-form-dialog__category-list">
                    {categories.map((category) => (
                      <label key={category.id} className="coupon-form-dialog__category-item">
                        <input
                          type="checkbox"
                          checked={formData.targetCategories.includes(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                        />
                        <span className="coupon-form-dialog__category-checkbox"></span>
                        <span className="coupon-form-dialog__category-name">{category.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="coupon-form-dialog__section">
            <h3 className="coupon-form-dialog__section-title">발급 대상</h3>
            
            <div className="coupon-form-dialog__field">
              <label className="coupon-form-dialog__label">발급 대상 *</label>
              <div className="coupon-form-dialog__radio-group">
                <label className="coupon-form-dialog__radio">
                  <input
                    type="radio"
                    name="issueType"
                    value="all"
                    checked={formData.issueType === 'all'}
                    onChange={() => handleChange('issueType', 'all')}
                  />
                  <span className="coupon-form-dialog__radio-custom"></span>
                  <span className="coupon-form-dialog__radio-label">전체 회원</span>
                </label>
                <label className="coupon-form-dialog__radio">
                  <input
                    type="radio"
                    name="issueType"
                    value="new"
                    checked={formData.issueType === 'new'}
                    onChange={() => handleChange('issueType', 'new')}
                  />
                  <span className="coupon-form-dialog__radio-custom"></span>
                  <span className="coupon-form-dialog__radio-label">신규 회원</span>
                </label>
              </div>
            </div>
          </div>

          <div className="coupon-form-dialog__section">
            <h3 className="coupon-form-dialog__section-title">유효 기간</h3>
            
            <div className="coupon-form-dialog__field">
              <label className="coupon-form-dialog__label">유효 기간 유형 *</label>
              <div className="coupon-form-dialog__radio-group">
                <label className="coupon-form-dialog__radio">
                  <input
                    type="radio"
                    name="validityType"
                    value="fixed"
                    checked={formData.validityType === 'fixed'}
                    onChange={() => handleChange('validityType', 'fixed')}
                  />
                  <span className="coupon-form-dialog__radio-custom"></span>
                  <span className="coupon-form-dialog__radio-label">기간 지정</span>
                </label>
                <label className="coupon-form-dialog__radio">
                  <input
                    type="radio"
                    name="validityType"
                    value="afterIssue"
                    checked={formData.validityType === 'afterIssue'}
                    onChange={() => handleChange('validityType', 'afterIssue')}
                  />
                  <span className="coupon-form-dialog__radio-custom"></span>
                  <span className="coupon-form-dialog__radio-label">발급 후 N일</span>
                </label>
              </div>
            </div>

            {formData.validityType === 'fixed' && (
              <DateRangePicker
                startDate={formData.validFrom}
                endDate={formData.validTo}
                onStartDateChange={(date) => handleChange('validFrom', date)}
                onEndDateChange={(date) => handleChange('validTo', date)}
              />
            )}

            {formData.validityType === 'afterIssue' && (
              <div className="coupon-form-dialog__field">
                <label className="coupon-form-dialog__label">유효 일수 *</label>
                <input
                  type="number"
                  className="coupon-form-dialog__input"
                  value={formData.validDays}
                  onChange={(e) => handleChange('validDays', parseInt(e.target.value) || 30)}
                  min={1}
                  required={formData.validityType === 'afterIssue'}
                />
              </div>
            )}
          </div>

          <div className="coupon-form-dialog__section">
            <div className="coupon-form-dialog__field">
              <label className="coupon-form-dialog__checkbox">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                />
                <span>활성화 상태로 생성</span>
              </label>
            </div>
          </div>

          <div className="coupon-form-dialog__actions">
            <button
              type="button"
              className="coupon-form-dialog__button coupon-form-dialog__button--cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="coupon-form-dialog__button coupon-form-dialog__button--submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? '저장 중...' : isEditing ? '수정' : '생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
