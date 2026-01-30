import { useMemo, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useGoBack } from '../../../hooks/useGoBack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useImageUploader } from '../../../hooks/useImageUploader';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { AlertModal, AppBar } from '@components';
import { AppBarSpacer } from '../../../components/AppBar';
import {
  createProductInquiry,
  fetchProductDetail,
  type CreateProductInquiryPayload,
} from '../api/productDetailApi';
import './WriteInquiryPage.css';

interface ProductSummary {
  id: string;
  name: string;
  thumbnailUrl?: string;
}

const INQUIRY_OPTIONS: Array<{
  value: CreateProductInquiryPayload['inquiryType'];
  label: string;
}> = [
  { value: 'product', label: '상품문의' },
  { value: 'shipping', label: '배송문의' },
  { value: 'exchange_return', label: '교환/반품' },
  { value: 'refund', label: '환불문의' },
  { value: 'other', label: '기타문의' },
];

const MAX_TITLE_LENGTH = 50;
const MAX_CONTENT_LENGTH = 500;

function ChevronDownIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="20" rx="4" fill="#D9D9D9" />
      <path d="M6 8L10 12L14 8" stroke="rgba(12, 12, 12, 0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AddPhotoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="22" height="22" rx="4" fill="#D9D9D9" />
      <path d="M11 6V16" stroke="rgba(12, 12, 12, 0.6)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 11H16" stroke="rgba(12, 12, 12, 0.6)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="22" height="22" rx="4" fill="#D9D9D9" />
      <path d="M19 15.5C19 15.8978 18.842 16.2794 18.5607 16.5607C18.2794 16.842 17.8978 17 17.5 17H4.5C4.10218 17 3.72064 16.842 3.43934 16.5607C3.15804 16.2794 3 15.8978 3 15.5V8C3 7.60218 3.15804 7.22064 3.43934 6.93934C3.72064 6.65804 4.10218 6.5 4.5 6.5H7L8.5 4.5H13.5L15 6.5H17.5C17.8978 6.5 18.2794 6.65804 18.5607 6.93934C18.842 7.22064 19 7.60218 19 8V15.5Z" stroke="rgba(12, 12, 12, 0.6)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="11" cy="11" r="2.5" stroke="rgba(12, 12, 12, 0.6)" strokeWidth="1.2"/>
    </svg>
  );
}

export default function WriteInquiryPage() {
  const { productId } = useParams<{ productId: string }>();
  const goBack = useGoBack();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(!isAuthenticated);

  const handleLoginConfirm = () => {
    setShowLoginModal(false);
    navigate('/login', { state: { from: location.pathname } });
  };

  const productFromState: ProductSummary | undefined = location.state?.product;

  const { data: productDetail, isLoading: isProductLoading } = useQuery({
    queryKey: ['product-summary', productId],
    queryFn: async () => {
      if (!productId) {
        throw new Error('상품 정보가 없습니다.');
      }
      const detail = await fetchProductDetail(productId);
      const productSummary: ProductSummary = {
        id: detail.id,
        name: detail.name,
        thumbnailUrl: detail.thumbnailUrl,
      };
      return productSummary;
    },
    enabled: !productFromState && Boolean(productId),
  });

  const productInfo = useMemo<ProductSummary | undefined>(() => {
    return productFromState || productDetail;
  }, [productFromState, productDetail]);

  const [selectedType, setSelectedType] = useState<CreateProductInquiryPayload['inquiryType']>('product');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  const {
    images,
    canAddMore,
    hasUploadingImages,
    openFilePicker,
    handleFileChange,
    fileInputRef,
    removeImage,
    getUploadedUrls,
    pickFromCamera,
    pickFromGallery,
    isCapacitorEnvironment,
  } = useImageUploader({ purpose: 'inquiry', maxImages: 10 });

  const createInquiryMutation = useMutation({
    mutationFn: async () => {
      if (!productId) {
        throw new Error('상품 정보가 없습니다.');
      }

      const imageUrls = getUploadedUrls();
      await createProductInquiry(productId, {
        inquiryType: selectedType,
        title: title.trim(),
        question: content.trim(),
        isPrivate,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['productInquiries', productId] });
      showToast('문의가 등록되었습니다.', 'success');
      goBack();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : '문의 등록에 실패했습니다.';
      showToast(message, 'error');
    },
  });

  const isSubmitDisabled =
    !title.trim() ||
    !content.trim() ||
    createInquiryMutation.isPending ||
    !productInfo ||
    hasUploadingImages;

  const handleSubmit = () => {
    if (isSubmitDisabled) {
      return;
    }

    createInquiryMutation.mutate();
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value.length <= MAX_TITLE_LENGTH) {
      setTitle(value);
    }
  };

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    if (value.length <= MAX_CONTENT_LENGTH) {
      setContent(value);
    }
  };

  const contentLength = content.length;

  return (
    <div className="write-inquiry-page">
      <AlertModal
        isOpen={showLoginModal}
        title="로그인 후 이용해주세요"
        onConfirm={handleLoginConfirm}
      />
      <AppBar
        variant="subpage"
        title="문의하기"
        showBackButton
        onBackClick={goBack}
      />
      <AppBarSpacer variant="subpage" />

      <main className="write-inquiry-page__main">
        {isProductLoading ? (
          <div className="write-inquiry-page__loading" />
        ) : (
          <div className="write-inquiry-page__product-name">{productInfo?.name}</div>
        )}

        <section className="write-inquiry-page__section">
          <div className="write-inquiry-page__select" onClick={() => setIsTypeOpen((prev) => !prev)} role="button" tabIndex={0}>
            <span>{INQUIRY_OPTIONS.find((option) => option.value === selectedType)?.label || '문의 유형 선택'}</span>
            <ChevronDownIcon />
          </div>
          {isTypeOpen && (
            <div className="write-inquiry-page__select-menu">
              {INQUIRY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="write-inquiry-page__select-option"
                  onClick={() => {
                    setSelectedType(option.value);
                    setIsTypeOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="write-inquiry-page__section">
          <div className="write-inquiry-page__field-label">문의 작성</div>
          <input
            type="text"
            className="write-inquiry-page__input"
            placeholder="제목을 입력해주세요"
            value={title}
            onChange={handleTitleChange}
          />
          <div className="write-inquiry-page__textarea-wrapper">
            <textarea
              className="write-inquiry-page__textarea"
              placeholder="내용을 입력해주세요"
              value={content}
              onChange={handleContentChange}
            />
            <div className="write-inquiry-page__counter">{contentLength} / {MAX_CONTENT_LENGTH}</div>
          </div>
        </section>

        <section className="write-inquiry-page__section write-inquiry-page__checkbox-row">
          <label className="write-inquiry-page__checkbox">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(event) => setIsPrivate(event.target.checked)}
            />
            <span>비밀글로 문의하기</span>
          </label>
        </section>

        <section className="write-inquiry-page__section">
          <div className="write-inquiry-page__field-label">사진 첨부(선택)</div>
          <p className="write-inquiry-page__helper">사진은 최대 10장, jpg, png 파일만 가능해요</p>
          <div className="write-inquiry-page__images">
            {isCapacitorEnvironment ? (
              <>
                <button
                  className="write-inquiry-page__image-add"
                  type="button"
                  onClick={pickFromCamera}
                  disabled={!canAddMore}
                  title="카메라로 촬영"
                >
                  <CameraIcon />
                </button>
                <button
                  className="write-inquiry-page__image-add"
                  type="button"
                  onClick={pickFromGallery}
                  disabled={!canAddMore}
                  title="갤러리에서 선택"
                >
                  <AddPhotoIcon />
                </button>
              </>
            ) : (
              <button
                className="write-inquiry-page__image-add"
                type="button"
                onClick={openFilePicker}
                disabled={!canAddMore}
              >
                <AddPhotoIcon />
              </button>
            )}
            {images.map((image, index) => (
              <div key={image.previewUrl} className="write-inquiry-page__image-item">
                <img src={image.previewUrl} alt={`첨부 이미지 ${index + 1}`} className="write-inquiry-page__image-preview" />
                <button
                  className="write-inquiry-page__image-remove"
                  type="button"
                  onClick={() => removeImage(index)}
                  aria-label="이미지 삭제"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            className="write-inquiry-page__file-input"
            onChange={handleFileChange}
          />
        </section>
      </main>

      <footer className="write-inquiry-page__footer">
        <button
          className={`write-inquiry-page__submit ${isSubmitDisabled ? 'write-inquiry-page__submit--disabled' : ''}`}
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
        >
          {createInquiryMutation.isPending ? '등록 중...' : '등록'}
        </button>
      </footer>
    </div>
  );
}
