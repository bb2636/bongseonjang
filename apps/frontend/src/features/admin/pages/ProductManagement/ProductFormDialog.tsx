import { useRef, useEffect, useLayoutEffect, ChangeEvent, useState } from 'react';
import { useProductForm, ProductOption, ProductInfo, ShippingSurcharge, ShippingRegion } from './useProductForm';
import { ConfirmModal, Select, MultiSelect } from '../../../../components';
import { useToast } from '../../../../contexts/ToastContext';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import './ProductFormDialog.css';

interface ProductFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productId?: string;
}

const SHIPPING_REGION_OPTIONS: Array<{ value: ShippingRegion; label: string }> = [
  { value: 'JEJU_ISLAND', label: '제주/도서산간' },
  { value: 'JEJU', label: '제주' },
  { value: 'ISLAND', label: '도서산간' },
];

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 3.33334V12.6667M3.33334 8H12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function ProductFormDialog({
  isOpen,
  onClose,
  onSuccess,
  productId,
}: ProductFormDialogProps) {
  const isEditMode = !!productId;
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const detailInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const initializedRef = useRef(false);
  const lastProductIdRef = useRef<string | undefined>(undefined);
  const hasSubmittedRef = useRef(false);
  const { showToast } = useToast();
  useBodyScrollLock(isOpen);

  const {
    formData,
    categories,
    exposureCategories,
    isSubmitting,
    isLoading,
    error,
    fieldErrors,
    touched,
    shippingLabels,
    fetchCategories,
    fetchExposureCategories,
    loadProduct,
    handleNameChange,
    handleCategoryChange,
    handleExposureCategoryChange,
    handleBasePriceChange,
    handleDiscountEnabledChange,
    handleDiscountRateChange,
    handleDescriptionChange,
    handleCautionChange,
    handleStorageMethodChange,
    handleExpirationInfoChange,
    handleWeightChange,
    handleOriginChange,
    handleShippingMethodChange,
    handleStockQuantityChange,
    handleUseOptionsChange,
    handleOptionGroupNameChange,
    handleOptionChange,
    handleAddOption,
    handleRemoveOption,
    handleShippingSurchargeChange,
    handleAddShippingSurcharge,
    handleRemoveShippingSurcharge,
    handleShippingInfoChange,
    handleThumbnailImageAdd,
    handleThumbnailImageRemove,
    handleDetailImageAdd,
    handleDetailImageRemove,
    clearFieldError,
    markFieldTouched,
    resetForm,
    submitForm,
  } = useProductForm();

  const hasError = (field: string) => touched[field] && fieldErrors[field as keyof typeof fieldErrors];
  const getErrorMessage = (field: string) => fieldErrors[field as keyof typeof fieldErrors];

  useLayoutEffect(() => {
    if (!isOpen) {
      setShowConfirmModal(false);
      hasSubmittedRef.current = false;
      initializedRef.current = false;
      lastProductIdRef.current = undefined;
      return;
    }

    setShowConfirmModal(false);
    hasSubmittedRef.current = false;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const shouldInitialize = !initializedRef.current || lastProductIdRef.current !== productId;
    
    if (shouldInitialize) {
      initializedRef.current = true;
      lastProductIdRef.current = productId;
      
      fetchCategories();
      fetchExposureCategories();
      
      if (productId) {
        console.log('[DEBUG useEffect] Loading product:', productId);
        loadProduct(productId);
      } else {
        resetForm();
      }
    }
  }, [isOpen, productId, fetchCategories, fetchExposureCategories, loadProduct, resetForm]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    const success = await submitForm();
    if (success) {
      hasSubmittedRef.current = true;
      onSuccess();
      showToast(isEditMode ? '상품이 수정되었습니다' : '상품이 등록되었습니다', 'success');
      onClose();
    }
  };

  const handleReset = () => {
    resetForm();
  };

  const handleThumbnailFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleThumbnailImageAdd(file);
    }
    e.target.value = '';
  };

  const handleDetailFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleDetailImageAdd(file);
    }
    e.target.value = '';
  };

  return (
    <div className="product-form-dialog__overlay" onClick={handleOverlayClick}>
      <div className="product-form-dialog">
        <header className="product-form-dialog__header">
          <div className="product-form-dialog__header-spacer" />
          <h2 className="product-form-dialog__title">{isEditMode ? '상품 수정' : '신규 상품 추가'}</h2>
          <button
            className="product-form-dialog__close-button"
            onClick={onClose}
            type="button"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M16.5 5.5L5.5 16.5M5.5 5.5L16.5 16.5" stroke="#101112" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </header>

        <div className="product-form-dialog__content">
          {isLoading ? (
            <div className="product-form-dialog__loading">
              <div className="product-form-dialog__loading-spinner" />
              <p>상품 정보를 불러오는 중...</p>
            </div>
          ) : (
          <>
          <section className="product-form-dialog__section">
            <h3 className="product-form-dialog__section-title">기본 정보</h3>

            <div className="product-form-dialog__form-field" style={{ marginBottom: 16 }}>
              <label className="product-form-dialog__label">
                썸네일 이미지 (최대 5장) <span className="product-form-dialog__required">*</span>
              </label>
              <div className={`product-form-dialog__images-container ${hasError('thumbnailImages') ? 'product-form-dialog__images-container--error' : ''}`}>
                {formData.thumbnailImages.map((img) => (
                  <div key={img.id} className="product-form-dialog__image-slot product-form-dialog__image-slot--filled">
                    <img src={img.previewUrl} alt="썸네일" className="product-form-dialog__image-preview" />
                    <button
                      type="button"
                      className="product-form-dialog__image-remove"
                      onClick={() => handleThumbnailImageRemove(img.id)}
                    >
                      <CloseIcon />
                    </button>
                  </div>
                ))}
                {formData.thumbnailImages.length < 5 && (
                  <div
                    className={`product-form-dialog__image-slot ${hasError('thumbnailImages') ? 'product-form-dialog__image-slot--error' : ''}`}
                    onClick={() => thumbnailInputRef.current?.click()}
                  >
                    <span className="product-form-dialog__image-add-icon">
                      <PlusIcon />
                    </span>
                  </div>
                )}
              </div>
              {hasError('thumbnailImages') && (
                <span className="product-form-dialog__error-message">{getErrorMessage('thumbnailImages')}</span>
              )}
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                className="product-form-dialog__file-input"
                onChange={handleThumbnailFileChange}
              />
            </div>

            <div className="product-form-dialog__form-field" style={{ marginBottom: 16 }}>
              <label className="product-form-dialog__label">
                상세페이지 이미지 (최대 5장) <span className="product-form-dialog__required">*</span>
              </label>
              <div className={`product-form-dialog__images-container ${hasError('detailImages') ? 'product-form-dialog__images-container--error' : ''}`}>
                {formData.detailImages.map((img) => (
                  <div key={img.id} className="product-form-dialog__image-slot product-form-dialog__image-slot--filled">
                    <img src={img.previewUrl} alt="상세" className="product-form-dialog__image-preview" />
                    <button
                      type="button"
                      className="product-form-dialog__image-remove"
                      onClick={() => handleDetailImageRemove(img.id)}
                    >
                      <CloseIcon />
                    </button>
                  </div>
                ))}
                {formData.detailImages.length < 5 && (
                  <div
                    className={`product-form-dialog__image-slot ${hasError('detailImages') ? 'product-form-dialog__image-slot--error' : ''}`}
                    onClick={() => detailInputRef.current?.click()}
                  >
                    <span className="product-form-dialog__image-add-icon">
                      <PlusIcon />
                    </span>
                  </div>
                )}
              </div>
              {hasError('detailImages') && (
                <span className="product-form-dialog__error-message">{getErrorMessage('detailImages')}</span>
              )}
              <input
                ref={detailInputRef}
                type="file"
                accept="image/*"
                className="product-form-dialog__file-input"
                onChange={handleDetailFileChange}
              />
            </div>

            <div className="product-form-dialog__form-row">
              <div className="product-form-dialog__form-field">
                <label className="product-form-dialog__label">
                  상품명 <span className="product-form-dialog__required">*</span>
                </label>
                <input
                  type="text"
                  className={`product-form-dialog__input ${hasError('name') ? 'product-form-dialog__input--error' : ''}`}
                  placeholder="예: 제철 생굴 2kg(손질 완료)"
                  value={formData.name}
                  onChange={(e) => {
                    handleNameChange(e.target.value);
                    clearFieldError('name');
                  }}
                />
                {hasError('name') && (
                  <span className="product-form-dialog__error-message">{getErrorMessage('name')}</span>
                )}
              </div>
              <div className="product-form-dialog__form-field product-form-dialog__form-field--half">
                <label className="product-form-dialog__label">
                  {formData.useOptions ? '전체 재고' : '재고 수량'}
                </label>
                {formData.useOptions ? (
                  <input
                    type="text"
                    className="product-form-dialog__input product-form-dialog__input--readonly"
                    value={formData.options.reduce((sum, opt) => sum + (opt.stock || 0), 0).toLocaleString()}
                    readOnly
                  />
                ) : (
                  <input
                    type="text"
                    inputMode="numeric"
                    className="product-form-dialog__input"
                    placeholder="0"
                    value={formData.stockQuantity ? formData.stockQuantity.toLocaleString() : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      const numValue = Math.max(0, Number(value) || 0);
                      handleStockQuantityChange(numValue);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '.') {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const pastedText = e.clipboardData.getData('text');
                      if (!/^\d+$/.test(pastedText.replace(/,/g, ''))) {
                        e.preventDefault();
                      }
                    }}
                  />
                )}
              </div>
              <div className="product-form-dialog__form-field product-form-dialog__form-field--half">
                <label className="product-form-dialog__label">
                  상품 카테고리 <span className="product-form-dialog__required">*</span>
                </label>
                <Select
                  options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
                  value={formData.categoryId}
                  onChange={(val) => {
                    handleCategoryChange(val);
                    clearFieldError('categoryId');
                  }}
                  placeholder="선택"
                  width={200}
                  hasError={!!hasError('categoryId')}
                />
                {hasError('categoryId') && (
                  <span className="product-form-dialog__error-message">{getErrorMessage('categoryId')}</span>
                )}
              </div>
            </div>

            <div className="product-form-dialog__form-row">
              <div className="product-form-dialog__form-field product-form-dialog__form-field--third">
                <label className="product-form-dialog__label">
                  기본 판매가(원) <span className="product-form-dialog__required">*</span>
                </label>
                <input
                  type="number"
                  className={`product-form-dialog__input ${hasError('basePrice') ? 'product-form-dialog__input--error' : ''}`}
                  placeholder="0"
                  value={formData.basePrice || ''}
                  onChange={(e) => {
                    handleBasePriceChange(Number(e.target.value));
                    clearFieldError('basePrice');
                  }}
                />
                {hasError('basePrice') && (
                  <span className="product-form-dialog__error-message">{getErrorMessage('basePrice')}</span>
                )}
              </div>
              <div className="product-form-dialog__form-field product-form-dialog__form-field--third">
                <label className="product-form-dialog__label">할인율(%)</label>
                <div className="product-form-dialog__inline-row">
                  <input
                    type="number"
                    className="product-form-dialog__input"
                    placeholder="0"
                    min={0}
                    max={100}
                    value={formData.discountRate || ''}
                    onChange={(e) => handleDiscountRateChange(Number(e.target.value))}
                    disabled={!formData.discountEnabled}
                  />
                  <span className="product-form-dialog__unit">%</span>
                </div>
              </div>
              <div className="product-form-dialog__form-field product-form-dialog__form-field--third">
                <label className="product-form-dialog__label">
                  노출 카테고리 <span className="product-form-dialog__required">*</span>
                </label>
                <MultiSelect
                  options={exposureCategories.map((cat) => ({ value: cat.id, label: cat.name }))}
                  values={formData.exposureCategoryIds}
                  onChange={(vals) => {
                    handleExposureCategoryChange(vals);
                    clearFieldError('exposureCategoryIds');
                  }}
                  placeholder="선택 (복수 선택 가능)"
                  width={250}
                  hasError={!!hasError('exposureCategoryIds')}
                />
                {hasError('exposureCategoryIds') && (
                  <span className="product-form-dialog__error-message">{getErrorMessage('exposureCategoryIds')}</span>
                )}
              </div>
            </div>

            <div className="product-form-dialog__form-row">
              <div className="product-form-dialog__checkbox-row">
                <input
                  type="checkbox"
                  id="discountEnabled"
                  className="product-form-dialog__checkbox"
                  checked={formData.discountEnabled}
                  onChange={(e) => handleDiscountEnabledChange(e.target.checked)}
                />
                <label htmlFor="discountEnabled" className="product-form-dialog__checkbox-label">
                  할인
                </label>
              </div>
            </div>

            {formData.discountEnabled && (
              <div className="product-form-dialog__form-row">
                <div className="product-form-dialog__form-field product-form-dialog__form-field--third">
                  <label className="product-form-dialog__label">할인가격(원)</label>
                  <div className="product-form-dialog__inline-row">
                    <input
                      type="number"
                      className="product-form-dialog__input"
                      value={formData.discountedPrice}
                      readOnly
                    />
                    <span className="product-form-dialog__unit">원</span>
                  </div>
                </div>
              </div>
            )}


            <div className="product-form-dialog__form-field" style={{ marginTop: 16 }}>
              <label className="product-form-dialog__label">
                상품설명 <span className="product-form-dialog__required">*</span>
              </label>
              <textarea
                className={`product-form-dialog__textarea ${hasError('description') ? 'product-form-dialog__textarea--error' : ''}`}
                placeholder="상품 특징, 소질 상태, 보관 방법, 주전 요리법 등을 입력하세요"
                value={formData.description}
                onChange={(e) => {
                  handleDescriptionChange(e.target.value);
                  clearFieldError('description');
                }}
                maxLength={5000}
              />
              {hasError('description') && (
                <span className="product-form-dialog__error-message">{getErrorMessage('description')}</span>
              )}
              <div className="product-form-dialog__textarea-count">
                {formData.description.length}/5000
              </div>
            </div>

            <div className="product-form-dialog__form-field" style={{ marginTop: 16 }}>
              <label className="product-form-dialog__label">주의사항</label>
              <textarea
                className="product-form-dialog__textarea"
                placeholder="주의사항 입력"
                value={formData.caution}
                onChange={(e) => handleCautionChange(e.target.value)}
                maxLength={2000}
              />
              <div className="product-form-dialog__textarea-count">
                {formData.caution.length}/2000
              </div>
            </div>

          </section>

          <div className="product-form-dialog__divider" />

          <section className="product-form-dialog__section">
            <h3 className="product-form-dialog__section-title">옵션 정보</h3>
            <div className="product-form-dialog__form-field" style={{ marginBottom: 16 }}>
              <label className="product-form-dialog__label">옵션 사용 여부</label>
              <div className="product-form-dialog__radio-group">
                <label className="product-form-dialog__radio-label">
                  <input
                    type="radio"
                    className="product-form-dialog__radio"
                    checked={!formData.useOptions}
                    onChange={() => handleUseOptionsChange(false)}
                  />
                  <span className="product-form-dialog__radio-text">옵션 사용 안 함</span>
                </label>
                <label className="product-form-dialog__radio-label">
                  <input
                    type="radio"
                    className="product-form-dialog__radio"
                    checked={formData.useOptions}
                    onChange={() => handleUseOptionsChange(true)}
                  />
                  <span className="product-form-dialog__radio-text">옵션 사용</span>
                </label>
              </div>
            </div>

            {formData.useOptions && (
              <>
                <div className="product-form-dialog__form-field" style={{ marginBottom: 16 }}>
                  <label className="product-form-dialog__label">옵션 그룹명</label>
                  <input
                    type="text"
                    className="product-form-dialog__input"
                    placeholder="예: 용량, 중량, 사이즈"
                    value={formData.optionGroupName}
                    onChange={(e) => handleOptionGroupNameChange(e.target.value)}
                    style={{ maxWidth: 300 }}
                  />
                </div>
                <div className="product-form-dialog__option-list">
                  {formData.options.map((option: ProductOption, index: number) => (
                    <div key={option.id} className="product-form-dialog__option-row">
                      <input
                        type="text"
                        className="product-form-dialog__input product-form-dialog__option-input"
                        placeholder="예) 수량, 중량, 크기"
                        value={option.optionValue}
                        onChange={(e) => handleOptionChange(option.id, 'optionValue', e.target.value)}
                      />
                      <input
                        type="number"
                        className="product-form-dialog__input product-form-dialog__option-input--price"
                        placeholder="추가금액 (0=기본가)"
                        value={option.price || ''}
                        onChange={(e) => handleOptionChange(option.id, 'price', e.target.value ? Number(e.target.value) : null)}
                      />
                      <span className="product-form-dialog__unit">원</span>
                      <input
                        type="number"
                        className="product-form-dialog__input product-form-dialog__option-input--stock"
                        placeholder="재고"
                        value={option.stock || ''}
                        onChange={(e) => handleOptionChange(option.id, 'stock', Number(e.target.value))}
                      />
                      {formData.options.length > 1 && (
                        <button
                          type="button"
                          className="product-form-dialog__remove-button"
                          onClick={() => handleRemoveOption(option.id)}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="product-form-dialog__add-button"
                  onClick={handleAddOption}
                  style={{ marginTop: 12 }}
                >
                  <PlusIcon /> 옵션 추가
                </button>
              </>
            )}
          </section>

          <div className="product-form-dialog__divider" />

          <section className="product-form-dialog__section">
            <h3 className="product-form-dialog__section-title">상품정보 작성</h3>
            <div className="product-form-dialog__grid-row">
              <div className="product-form-dialog__form-field">
                <label className="product-form-dialog__label">중량</label>
                <input
                  type="text"
                  className="product-form-dialog__input"
                  placeholder="예: 1kg, 500g"
                  value={formData.weight}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  maxLength={50}
                />
              </div>
              <div className="product-form-dialog__form-field">
                <label className="product-form-dialog__label">보관방법</label>
                <input
                  type="text"
                  className="product-form-dialog__input"
                  placeholder="예: 냉동보관, 냉장보관, 상온보관"
                  value={formData.storageMethod}
                  onChange={(e) => handleStorageMethodChange(e.target.value)}
                  maxLength={100}
                />
              </div>
            </div>
            <div className="product-form-dialog__grid-row">
              <div className="product-form-dialog__form-field">
                <label className="product-form-dialog__label">원산지</label>
                <input
                  type="text"
                  className="product-form-dialog__input"
                  placeholder="예: 국내산, 러시아산"
                  value={formData.origin}
                  onChange={(e) => handleOriginChange(e.target.value)}
                  maxLength={100}
                />
              </div>
              <div className="product-form-dialog__form-field">
                <label className="product-form-dialog__label">유통기한</label>
                <input
                  type="text"
                  className="product-form-dialog__input"
                  placeholder="예: 제조일로부터 12개월, 상세페이지 참조"
                  value={formData.expirationInfo}
                  onChange={(e) => handleExpirationInfoChange(e.target.value)}
                  maxLength={200}
                />
              </div>
            </div>
          </section>

          <div className="product-form-dialog__divider" />

          <section className="product-form-dialog__section">
            <h3 className="product-form-dialog__section-title">배송정보 작성</h3>
            <div className="product-form-dialog__grid-row">
              <div className="product-form-dialog__form-field">
                <label className="product-form-dialog__label">배송비</label>
                <div className="product-form-dialog__inline-row">
                  <input
                    type="number"
                    className="product-form-dialog__input"
                    placeholder="3500"
                    value={formData.shippingInfo.shippingFee ?? ''}
                    onChange={(e) => handleShippingInfoChange('shippingFee', e.target.value ? Number(e.target.value) : null)}
                    min="0"
                    max="9999999"
                    style={{ flex: 1 }}
                  />
                  <span className="product-form-dialog__unit">원</span>
                </div>
              </div>
              <div className="product-form-dialog__form-field">
                <label className="product-form-dialog__label">배송방법</label>
                <input
                  type="text"
                  className="product-form-dialog__input"
                  placeholder="예: 택배, 직배송"
                  value={formData.shippingMethod}
                  onChange={(e) => handleShippingMethodChange(e.target.value)}
                  maxLength={100}
                />
              </div>
            </div>
            <div className="product-form-dialog__form-field" style={{ marginTop: 16 }}>
              <label className="product-form-dialog__label">배송가능지역</label>
              <input
                type="text"
                className="product-form-dialog__input"
                placeholder="예: 제주 도서산간 제외 전국 배송"
                value={formData.shippingInfo.shippingDescription}
                onChange={(e) => handleShippingInfoChange('shippingDescription', e.target.value)}
              />
            </div>
            <div className="product-form-dialog__form-field" style={{ marginTop: 16 }}>
              <label className="product-form-dialog__label">추가배송비 (제주/도서산간 자동 합산)</label>
              <div className="product-form-dialog__product-infos">
                {formData.shippingSurcharges.map((surcharge: ShippingSurcharge) => (
                  <div key={surcharge.id} className="product-form-dialog__product-info-row">
                    <Select
                      options={SHIPPING_REGION_OPTIONS}
                      value={surcharge.region}
                      onChange={(val) => handleShippingSurchargeChange(surcharge.id, 'region', val as ShippingRegion)}
                      placeholder="대상 지역"
                      width={180}
                    />
                    <div className="product-form-dialog__inline-row" style={{ flex: 1 }}>
                      <input
                        type="number"
                        className="product-form-dialog__input"
                        placeholder="추가 금액 (예: 3000)"
                        value={surcharge.amount ?? ''}
                        onChange={(e) => handleShippingSurchargeChange(surcharge.id, 'amount', e.target.value ? Number(e.target.value) : null)}
                        min="0"
                        max="9999999"
                        style={{ flex: 1 }}
                      />
                      <span className="product-form-dialog__unit">원</span>
                    </div>
                    {formData.shippingSurcharges.length > 1 && (
                      <button
                        type="button"
                        className="product-form-dialog__remove-button"
                        onClick={() => handleRemoveShippingSurcharge(surcharge.id)}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="product-form-dialog__add-button"
                onClick={handleAddShippingSurcharge}
                style={{ marginTop: 12 }}
              >
                <PlusIcon /> 추가
              </button>
            </div>
          </section>
          </>
          )}
        </div>

        {error && (
          <div className="product-form-dialog__error">
            {error}
          </div>
        )}

        <footer className="product-form-dialog__footer">
          <button
            type="button"
            className="product-form-dialog__reset-button"
            onClick={handleReset}
            disabled={isSubmitting || isLoading}
          >
            초기화
          </button>
          <button
            type="button"
            className="product-form-dialog__submit-button"
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? '저장 중...' : (isEditMode ? '수정' : '등록')}
          </button>
        </footer>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        title={isEditMode ? '상품을 수정하시겠습니까?' : '상품을 등록하시겠습니까?'}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        cancelText="취소"
        confirmText="확인"
      />

    </div>
  );
}
