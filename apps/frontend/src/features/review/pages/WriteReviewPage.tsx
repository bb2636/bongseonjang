import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useImageUploader } from '../../../hooks/useImageUploader';
import { useGoBack } from '../../../hooks/useGoBack';
import './WriteReviewPage.css';

interface ProductInfo {
  id: string;
  name: string;
  thumbnailUrl?: string;
}

interface ExistingReview {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string | null;
  rating: number;
  content: string;
  imageUrls: string[];
}

async function fetchProductInfo(productId: string): Promise<ProductInfo> {
  const response = await fetch(`/api/products/${productId}`);
  if (!response.ok) {
    throw new Error('상품 정보를 불러올 수 없습니다.');
  }
  const product = await response.json();
  return {
    id: product.id,
    name: product.name,
    thumbnailUrl: product.thumbnailUrl,
  };
}

async function fetchReviewForEdit(reviewId: string): Promise<ExistingReview> {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/reviews/${reviewId}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!response.ok) throw new Error('리뷰를 불러올 수 없습니다.');
  return response.json();
}

function CloseIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.5 6.5L19.5 19.5M19.5 6.5L6.5 19.5" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function StarIcon({ filled, size = 36 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18 3L22.05 11.6325L31.5 13.1475L24.75 19.7175L26.49 29.13L18 24.7725L9.51 29.13L11.25 19.7175L4.5 13.1475L13.95 11.6325L18 3Z"
        fill={filled ? '#3B9BD5' : 'rgba(12, 12, 12, 0.1)'}
      />
    </svg>
  );
}

function ImageUploadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="rgba(12, 12, 12, 0.3)" strokeWidth="1.5"/>
      <circle cx="8.5" cy="8.5" r="1.5" stroke="rgba(12, 12, 12, 0.3)" strokeWidth="1.5"/>
      <path d="M21 15L16 10L5 21" stroke="rgba(12, 12, 12, 0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

async function createReview(data: {
  productId: string;
  rating: number;
  content: string;
  imageUrls?: string[];
  orderItemId?: string;
}) {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '리뷰 작성에 실패했습니다.');
  }

  return response.json();
}

async function updateReview(reviewId: string, data: {
  rating: number;
  content: string;
  imageUrls?: string[];
}) {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/reviews/${reviewId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '리뷰 수정에 실패했습니다.');
  }
  return response.json();
}

const MAX_CONTENT_LENGTH = 1000;
const MAX_IMAGES = 10;

export default function WriteReviewPage() {
  const { productId, reviewId } = useParams<{ productId?: string; reviewId?: string }>();
  const isEditMode = !!reviewId;
  
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const goBack = useGoBack();

  const stateProduct: ProductInfo | undefined = location.state?.product;
  const stateOrderItemId: string | undefined = location.state?.orderItemId;

  const { data: existingReview, isLoading: reviewLoading } = useQuery({
    queryKey: ['reviewForEdit', reviewId],
    queryFn: () => fetchReviewForEdit(reviewId!),
    enabled: isEditMode && !!reviewId,
  });

  const effectiveProductId = isEditMode ? existingReview?.productId : productId;

  const { data: fetchedProduct, isLoading: productLoading } = useQuery({
    queryKey: ['productInfo', effectiveProductId],
    queryFn: () => fetchProductInfo(effectiveProductId!),
    enabled: !!effectiveProductId && !stateProduct && !isEditMode,
  });

  const productInfo: ProductInfo | undefined = isEditMode && existingReview
    ? {
        id: existingReview.productId,
        name: existingReview.productName,
        thumbnailUrl: existingReview.productImageUrl || undefined,
      }
    : stateProduct || fetchedProduct;

  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

  const {
    images,
    isUploading,
    hasUploadingImages,
    canAddMore,
    fileInputRef,
    openFilePicker,
    handleFileChange,
    removeImage,
    getUploadedUrls,
  } = useImageUploader({ purpose: 'review', maxImages: MAX_IMAGES - existingImageUrls.length });

  useEffect(() => {
    if (isEditMode && existingReview) {
      setRating(existingReview.rating);
      setContent(existingReview.content);
      if (existingReview.imageUrls?.length > 0) {
        setExistingImageUrls(existingReview.imageUrls);
      }
    }
  }, [isEditMode, existingReview]);

  const createReviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productReviews', productId] });
      goBack();
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: (data: { rating: number; content: string; imageUrls?: string[] }) =>
      updateReview(reviewId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myReviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviewForEdit', reviewId] });
      goBack();
    },
  });

  const handleClose = () => {
    goBack();
  };

  const handleStarClick = (starIndex: number) => {
    setRating(starIndex);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CONTENT_LENGTH) {
      setContent(value);
    }
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) return;

    const newImageUrls = getUploadedUrls();
    const allImageUrls = [...existingImageUrls, ...newImageUrls];

    if (isEditMode) {
      updateReviewMutation.mutate({
        rating,
        content,
        imageUrls: allImageUrls.length > 0 ? allImageUrls : undefined,
      });
    } else {
      if (!productId) return;
      createReviewMutation.mutate({
        productId,
        rating,
        content,
        imageUrls: allImageUrls.length > 0 ? allImageUrls : undefined,
        orderItemId: stateOrderItemId,
      });
    }
  };

  const isPending = createReviewMutation.isPending || updateReviewMutation.isPending;
  const isSubmitDisabled = rating === 0 || isPending || (!isEditMode && !productInfo) || (isEditMode && !existingReview) || hasUploadingImages;
  const isLoading = isEditMode ? reviewLoading : productLoading;

  const totalImageCount = existingImageUrls.length + images.length;
  const canAddMoreImages = totalImageCount < MAX_IMAGES;

  if (isLoading) {
    return (
      <div className="write-review-page">
        <header className="write-review-page__header">
          <div className="write-review-page__header-spacer" />
          <h1 className="write-review-page__title">{isEditMode ? '리뷰 수정하기' : '리뷰 작성하기'}</h1>
          <button 
            className="write-review-page__close-btn" 
            onClick={handleClose}
            type="button"
          >
            <CloseIcon />
          </button>
        </header>
        <div className="write-review-page__loading">
          <div className="write-review-page__spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="write-review-page">
      <header className="write-review-page__header">
        <div className="write-review-page__header-spacer" />
        <h1 className="write-review-page__title">{isEditMode ? '리뷰 수정하기' : '리뷰 작성하기'}</h1>
        <button 
          className="write-review-page__close-btn" 
          onClick={handleClose}
          type="button"
        >
          <CloseIcon />
        </button>
      </header>

      <div className="write-review-page__content">
        <section className="write-review-page__product-info">
          <div className="write-review-page__product-thumbnail">
            {productInfo?.thumbnailUrl && (
              <img 
                src={productInfo.thumbnailUrl} 
                alt={productInfo.name} 
                className="write-review-page__product-image"
              />
            )}
          </div>
          <span className="write-review-page__product-name">
            {productInfo?.name || '상품명'}
          </span>
        </section>

        <section className="write-review-page__rating-section">
          <h2 className="write-review-page__section-title">이 상품 어떠셨나요?</h2>
          <div className="write-review-page__stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="write-review-page__star-btn"
                onClick={() => handleStarClick(star)}
              >
                <StarIcon filled={star <= rating} />
              </button>
            ))}
          </div>
        </section>

        <section className="write-review-page__photo-section">
          <div className="write-review-page__photo-header">
            <h2 className="write-review-page__section-title">사진 첨부(선택)</h2>
            <span className="write-review-page__photo-hint">
              사진은 최대 10장, jpg, png, pdf 파일만 가능해요
            </span>
          </div>
          <div className="write-review-page__photo-list">
            <button 
              type="button" 
              className="write-review-page__photo-add-btn"
              onClick={openFilePicker}
              disabled={!canAddMoreImages || isUploading}
            >
              <ImageUploadIcon />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={handleFileChange}
              className="write-review-page__file-input"
            />
            {existingImageUrls.map((url, index) => (
              <div key={`existing-${index}`} className="write-review-page__photo-preview">
                <img src={url} alt={`기존 이미지 ${index + 1}`} />
                <button
                  type="button"
                  className="write-review-page__photo-remove-btn"
                  onClick={() => handleRemoveExistingImage(index)}
                >
                  ×
                </button>
              </div>
            ))}
            {images.map((image, index) => (
              <div key={index} className="write-review-page__photo-preview">
                <img src={image.previewUrl} alt={`미리보기 ${index + 1}`} />
                {image.isUploading && (
                  <div className="write-review-page__photo-uploading">
                    <div className="write-review-page__photo-spinner" />
                  </div>
                )}
                {image.error && (
                  <div className="write-review-page__photo-error" title={image.error}>!</div>
                )}
                <button
                  type="button"
                  className="write-review-page__photo-remove-btn"
                  onClick={() => removeImage(index)}
                  disabled={image.isUploading}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="write-review-page__content-section">
          <h2 className="write-review-page__section-title">리뷰 작성</h2>
          <div className="write-review-page__textarea-wrapper">
            <textarea
              className="write-review-page__textarea"
              placeholder="내용을 입력해주세요"
              value={content}
              onChange={handleContentChange}
              maxLength={MAX_CONTENT_LENGTH}
            />
            <span className="write-review-page__char-count">
              {content.length} / {MAX_CONTENT_LENGTH}
            </span>
          </div>
        </section>
      </div>

      <div className="write-review-page__footer">
        <button
          type="button"
          className={`write-review-page__submit-btn ${isSubmitDisabled ? 'write-review-page__submit-btn--disabled' : ''}`}
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
        >
          {isPending ? (isEditMode ? '수정 중...' : '등록 중...') : (isEditMode ? '수정' : '등록')}
        </button>
      </div>

      {(createReviewMutation.isError || updateReviewMutation.isError) && (
        <div className="write-review-page__error">
          {createReviewMutation.error?.message || updateReviewMutation.error?.message || '리뷰 처리에 실패했습니다.'}
        </div>
      )}

      {(createReviewMutation.isSuccess || updateReviewMutation.isSuccess) && (
        <div className="write-review-page__success">
          {isEditMode ? '리뷰가 수정되었습니다.' : '리뷰가 등록되었습니다.'}
        </div>
      )}
    </div>
  );
}
