import { useRef, useEffect, ChangeEvent } from 'react';
import { useProductForm, ProductOption, ProductInfo } from './useProductForm';
import { ConfirmModal } from '../../../../components';
import { Snackbar } from '../../components/Snackbar';
import './ProductFormDialog.css';
import { useState } from 'react';

interface ProductFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

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
}: ProductFormDialogProps) {
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const detailInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);

  const {
    formData,
    categories,
    isSubmitting,
    error,
    shippingLabels,
    fetchCategories,
    handleNameChange,
    handleCategoryChange,
    handleBasePriceChange,
    handleDiscountEnabledChange,
    handleDiscountRateChange,
    handleStartDateChange,
    handleEndDateChange,
    handleCountdownDaysChange,
    handleDescriptionChange,
    handleCautionChange,
    handleUseOptionsChange,
    handleOptionGroupNameChange,
    handleOptionChange,
    handleAddOption,
    handleRemoveOption,
    handleProductInfoChange,
    handleAddProductInfo,
    handleRemoveProductInfo,
    handleShippingInfoChange,
    handleThumbnailImageAdd,
    handleThumbnailImageRemove,
    handleDetailImageAdd,
    handleDetailImageRemove,
    resetForm,
    submitForm,
  } = useProductForm();

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, fetchCategories]);

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
      onSuccess();
      setShowSnackbar(true);
    }
  };

  const handleSnackbarClose = () => {
    setShowSnackbar(false);
    onClose();
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
          <h2 className="product-form-dialog__title">신규 상품 추가</h2>
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
          <section className="product-form-dialog__section">
            <h3 className="product-form-dialog__section-title">기본 정보</h3>

            <div className="product-form-dialog__form-field" style={{ marginBottom: 16 }}>
              <label className="product-form-dialog__label">썸네일 이미지 (최대 5장)</label>
              <div className="product-form-dialog__images-container">
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
                    className="product-form-dialog__image-slot"
                    onClick={() => thumbnailInputRef.current?.click()}
                  >
                    <span className="product-form-dialog__image-add-icon">
                      <PlusIcon />
                    </span>
                  </div>
                )}
              </div>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                className="product-form-dialog__file-input"
                onChange={handleThumbnailFileChange}
              />
            </div>

            <div className="product-form-dialog__form-field" style={{ marginBottom: 16 }}>
              <label className="product-form-dialog__label">상세페이지 이미지 (최대 5장)</label>
              <div className="product-form-dialog__images-container">
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
                    className="product-form-dialog__image-slot"
                    onClick={() => detailInputRef.current?.click()}
                  >
                    <span className="product-form-dialog__image-add-icon">
                      <PlusIcon />
                    </span>
                  </div>
                )}
              </div>
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
                <label className="product-form-dialog__label">상품명</label>
                <input
                  type="text"
                  className="product-form-dialog__input"
                  placeholder="예: 제철 생굴 2kg(손질 완료)"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
              <div className="product-form-dialog__form-field product-form-dialog__form-field--half">
                <label className="product-form-dialog__label">상품 카테고리</label>
                <select
                  className="product-form-dialog__select"
                  value={formData.categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="">선택</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="product-form-dialog__form-row">
              <div className="product-form-dialog__form-field product-form-dialog__form-field--third">
                <label className="product-form-dialog__label">기본 판매가(원)</label>
                <input
                  type="number"
                  className="product-form-dialog__input"
                  placeholder="0"
                  value={formData.basePrice || ''}
                  onChange={(e) => handleBasePriceChange(Number(e.target.value))}
                />
              </div>
              <div className="product-form-dialog__form-field product-form-dialog__form-field--third">
                <label className="product-form-dialog__label">할인율(%)</label>
                <div className="product-form-dialog__inline-row">
                  <input
                    type="number"
                    className="product-form-dialog__input"
                    placeholder="0"
                    value={formData.discountRate || ''}
                    onChange={(e) => handleDiscountRateChange(Number(e.target.value))}
                    disabled={!formData.discountEnabled}
                  />
                  <span className="product-form-dialog__unit">%</span>
                </div>
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

            <div className="product-form-dialog__form-row">
              <div className="product-form-dialog__form-field product-form-dialog__form-field--third">
                <label className="product-form-dialog__label">판매 기간(시작일)</label>
                <input
                  type="date"
                  className="product-form-dialog__input"
                  value={formData.startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                />
              </div>
              <div className="product-form-dialog__form-field product-form-dialog__form-field--third">
                <label className="product-form-dialog__label">판매 기간(종료일)</label>
                <input
                  type="date"
                  className="product-form-dialog__input"
                  value={formData.endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                />
              </div>
              <div className="product-form-dialog__form-field product-form-dialog__form-field--third">
                <label className="product-form-dialog__label">카운트다운</label>
                <select
                  className="product-form-dialog__select"
                  value={formData.countdownDays ?? ''}
                  onChange={(e) => handleCountdownDaysChange(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">선택 안 함</option>
                  <option value="1">1일 전</option>
                  <option value="2">2일 전</option>
                  <option value="3">3일 전</option>
                  <option value="4">4일 전</option>
                  <option value="5">5일 전</option>
                  <option value="6">6일 전</option>
                  <option value="7">7일 전</option>
                </select>
              </div>
            </div>

            <div className="product-form-dialog__form-field" style={{ marginTop: 16 }}>
              <label className="product-form-dialog__label">상품설명</label>
              <textarea
                className="product-form-dialog__textarea"
                placeholder="상품 특징, 소질 상태, 보관 방법, 주전 요리법 등을 입력하세요"
                value={formData.description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                maxLength={5000}
              />
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
                        placeholder="옵션명"
                        value={option.optionValue}
                        onChange={(e) => handleOptionChange(option.id, 'optionValue', e.target.value)}
                      />
                      <input
                        type="number"
                        className="product-form-dialog__input product-form-dialog__option-input--price"
                        placeholder="판매가(원)"
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
            <h3 className="product-form-dialog__section-title">상품 정보</h3>
            <div className="product-form-dialog__option-list">
              {formData.productInfos.map((info: ProductInfo) => (
                <div key={info.id} className="product-form-dialog__info-row">
                  <input
                    type="text"
                    className="product-form-dialog__input product-form-dialog__info-label-input"
                    placeholder="항목명 (예: 원산지)"
                    value={info.label}
                    onChange={(e) => handleProductInfoChange(info.id, 'label', e.target.value)}
                  />
                  <input
                    type="text"
                    className="product-form-dialog__input product-form-dialog__info-value-input"
                    placeholder="내용 입력"
                    value={info.value}
                    onChange={(e) => handleProductInfoChange(info.id, 'value', e.target.value)}
                  />
                  <button
                    type="button"
                    className="product-form-dialog__add-button"
                    onClick={() => handleRemoveProductInfo(info.id)}
                    style={{ borderColor: '#FF3B30', color: '#FF3B30' }}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="product-form-dialog__add-button"
              onClick={handleAddProductInfo}
              style={{ marginTop: 12 }}
            >
              <PlusIcon /> 추가
            </button>
          </section>

          <div className="product-form-dialog__divider" />

          <section className="product-form-dialog__section">
            <h3 className="product-form-dialog__section-title">배송 정보</h3>
            <div className="product-form-dialog__shipping-row">
              <span className="product-form-dialog__shipping-label">{shippingLabels.shippingFee}</span>
              <input
                type="text"
                className="product-form-dialog__input product-form-dialog__shipping-value"
                placeholder="예: 3500원, 30만원 이상 구매 시 무료배송"
                value={formData.shippingInfo.shippingFee}
                onChange={(e) => handleShippingInfoChange('shippingFee', e.target.value)}
              />
            </div>
            <div className="product-form-dialog__shipping-row">
              <span className="product-form-dialog__shipping-label">{shippingLabels.shippingDescription}</span>
              <input
                type="text"
                className="product-form-dialog__input product-form-dialog__shipping-value"
                placeholder="예: 제주 도서산간 제외 전국 배송"
                value={formData.shippingInfo.shippingDescription}
                onChange={(e) => handleShippingInfoChange('shippingDescription', e.target.value)}
              />
            </div>
          </section>
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
            disabled={isSubmitting}
          >
            초기화
          </button>
          <button
            type="button"
            className="product-form-dialog__submit-button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '저장 중...' : '등록'}
          </button>
        </footer>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        title="상품을 등록하시겠습니까?"
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        cancelText="취소"
        confirmText="확인"
      />

      <Snackbar
        isOpen={showSnackbar}
        title="상품이 등록되었습니다"
        onClose={handleSnackbarClose}
      />
    </div>
  );
}
