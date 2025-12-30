import { useRef, useState, ChangeEvent } from 'react';
import { BannerPosition, Banner } from './useBannerManagement';
import { useBannerForm } from './useBannerForm';
import { ConfirmModal } from '../../../../components';
import { Snackbar } from '../../components/Snackbar';
import './BannerFormDialog.css';

interface BannerFormDialogProps {
  isOpen: boolean;
  positions: BannerPosition[];
  defaultPositionCode: string;
  editingBanner: Banner | null;
  onClose: () => void;
  onSuccess: () => void;
}


export function BannerFormDialog({
  isOpen,
  positions,
  defaultPositionCode,
  editingBanner,
  onClose,
  onSuccess,
}: BannerFormDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const isEditing = !!editingBanner;
  const {
    formData,
    isSubmitting,
    error,
    selectedFile,
    previewUrl,
    handleTitleChange,
    handlePositionChange,
    handleFileSelect,
    resetForm,
    submitForm,
  } = useBannerForm(positions, defaultPositionCode, editingBanner);

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

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="banner-form-dialog__overlay" onClick={handleOverlayClick}>
      <div className="banner-form-dialog">
        <header className="banner-form-dialog__header">
          <div className="banner-form-dialog__header-spacer" />
          <h2 className="banner-form-dialog__title">{isEditing ? '배너 수정' : '배너 등록'}</h2>
          <button 
            className="banner-form-dialog__close-button" 
            onClick={onClose}
            type="button"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M16.5 5.5L5.5 16.5M5.5 5.5L16.5 16.5" stroke="#101112" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </header>

        <div className="banner-form-dialog__content">
          <section className="banner-form-dialog__section">
            <h3 className="banner-form-dialog__section-title">기본 정보</h3>
            <div className="banner-form-dialog__form-row">
              <div className="banner-form-dialog__form-field">
                <label className="banner-form-dialog__label">배너명</label>
                <input
                  type="text"
                  className="banner-form-dialog__input"
                  placeholder="예 : 겨울 제철 굴, 전복 특가"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
              </div>
              <div className="banner-form-dialog__form-field">
                <label className="banner-form-dialog__label">배너 위치</label>
                <div className="banner-form-dialog__checkbox-group">
                  {positions.map((position) => (
                    <label key={position.code} className="banner-form-dialog__checkbox-label">
                      <input
                        type="checkbox"
                        className="banner-form-dialog__checkbox"
                        checked={formData.positionCode === position.code}
                        onChange={() => handlePositionChange(position.code)}
                      />
                      <span className="banner-form-dialog__checkbox-custom" />
                      <span className="banner-form-dialog__checkbox-text">{position.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="banner-form-dialog__divider" />

          <section className="banner-form-dialog__section">
            <h3 className="banner-form-dialog__section-title">이미지 첨부</h3>
            <div className="banner-form-dialog__image-section">
              <div className="banner-form-dialog__image-field">
                <label className="banner-form-dialog__label">배너 이미지</label>
                <div className="banner-form-dialog__image-upload">
                  <button 
                    type="button" 
                    className="banner-form-dialog__upload-button"
                    onClick={handleUploadClick}
                  >
                    이미지 업로드
                  </button>
                  <span className="banner-form-dialog__file-name">
                    {selectedFile ? selectedFile.name : '선택된 이미지 없음'}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="banner-form-dialog__file-input"
                    onChange={handleFileInputChange}
                  />
                </div>
                <p className="banner-form-dialog__hint">
                  권장 사이즈: 위치별 가이드에 따라 업로드 (예: 홈/히어로 375x247 등)
                </p>
                {previewUrl && (
                  <div className="banner-form-dialog__preview">
                    <img src={previewUrl} alt="미리보기" className="banner-form-dialog__preview-image" />
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {error && (
          <div className="banner-form-dialog__error">
            {error}
          </div>
        )}

        <footer className="banner-form-dialog__footer">
          <button 
            type="button" 
            className="banner-form-dialog__reset-button"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            초기화
          </button>
          <button 
            type="button" 
            className="banner-form-dialog__submit-button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '저장 중...' : '저장하기'}
          </button>
        </footer>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        title={isEditing ? "배너를 수정하시겠습니까?" : "배너를 등록하시겠습니까?"}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        cancelText="취소"
        confirmText="확인"
      />

      <Snackbar
        isOpen={showSnackbar}
        title={isEditing ? "배너가 수정되었습니다" : "배너가 등록되었습니다"}
        onClose={handleSnackbarClose}
      />
    </div>
  );
}
