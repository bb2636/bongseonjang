import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useImageUploader } from '../../../hooks/useImageUploader';
import { useToast } from '../../../contexts/ToastContext';
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

const MAX_CONTENT_LENGTH = 1000;

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

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.5 5.5L14.5 14.5" stroke="#101112" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14.5 5.5L5.5 14.5" stroke="#101112" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function WriteInquiryPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

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
  const [isPrivate, setIsPrivate] = useState(false);
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
      navigate(-1);
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
    setTitle(event.target.value);
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
      <header className="write-inquiry-page__header">
        <button className="write-inquiry-page__header-button" type="button" onClick={() => navigate(-1)}>
          <CloseIcon />
        </button>
        <h1 className="write-inquiry-page__title">문의하기</h1>
        <div className="write-inquiry-page__header-button" aria-hidden />
      </header>

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
          <p className="write-inquiry-page__helper">사진은 최대 10장, jpg, png, pdf 파일만 가능해요</p>
          <div className="write-inquiry-page__images">
            <button
              className="write-inquiry-page__image-add"
              type="button"
              onClick={openFilePicker}
              disabled={!canAddMore}
            >
              <AddPhotoIcon />
            </button>
            {images.map((image, index) => (
              <div key={image.previewUrl} className="write-inquiry-page__image-item">
                <img src={image.previewUrl} alt={`첨부 이미지 ${index + 1}`} className="write-inquiry-page__image-preview" />
                <button
                  className="write-inquiry-page__image-remove"
                  type="button"
                  onClick={() => removeImage(index)}
                  aria-label="이미지 삭제"
                >
                  <CloseIcon />
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
