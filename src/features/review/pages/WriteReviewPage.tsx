import { useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import './WriteReviewPage.css';

interface ProductInfo {
  id: string;
  name: string;
  thumbnailUrl?: string;
}

interface UploadedImage {
  file: File;
  previewUrl: string;
  uploadedUrl?: string;
  isUploading: boolean;
}

async function getUploadUrl(): Promise<string> {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('/api/upload/review-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!response.ok) {
    throw new Error('업로드 URL을 가져올 수 없습니다.');
  }
  const data = await response.json();
  return data.uploadURL;
}

async function uploadImageToStorage(file: File, uploadUrl: string): Promise<string> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });
  if (!response.ok) {
    throw new Error('이미지 업로드에 실패했습니다.');
  }
  const url = new URL(uploadUrl);
  return url.pathname;
}

async function confirmUploadedImage(imageURL: string): Promise<string> {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('/api/upload/confirm-review-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ imageURL }),
  });
  if (!response.ok) {
    throw new Error('이미지 확인에 실패했습니다.');
  }
  const data = await response.json();
  return data.objectPath;
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
}) {
  const token = localStorage.getItem('accessToken');
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

const MAX_CONTENT_LENGTH = 1000;
const MAX_IMAGES = 10;

export default function WriteReviewPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stateProduct: ProductInfo | undefined = location.state?.product;

  const { data: fetchedProduct, isLoading: productLoading } = useQuery({
    queryKey: ['productInfo', productId],
    queryFn: () => fetchProductInfo(productId!),
    enabled: !!productId && !stateProduct,
  });

  const productInfo = stateProduct || fetchedProduct;

  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const createReviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productReviews', productId] });
      navigate(-1);
    },
  });

  const handleClose = () => {
    navigate(-1);
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

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, MAX_IMAGES - uploadedImages.length);
    if (newFiles.length === 0) return;

    const newImages: UploadedImage[] = newFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isUploading: true,
    }));

    setUploadedImages((prev) => [...prev, ...newImages]);
    setIsUploadingImages(true);
    e.target.value = '';

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      try {
        const uploadUrl = await getUploadUrl();
        const objectPath = await uploadImageToStorage(file, uploadUrl);
        const confirmedPath = await confirmUploadedImage(objectPath);

        setUploadedImages((prev) =>
          prev.map((img) =>
            img.file === file
              ? { ...img, uploadedUrl: confirmedPath, isUploading: false }
              : img
          )
        );
      } catch (error) {
        console.error('Image upload failed:', error);
        setUploadedImages((prev) => prev.filter((img) => img.file !== file));
      }
    }

    setIsUploadingImages(false);
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => {
      const removed = prev[index];
      if (removed?.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    if (!productId || rating === 0) return;

    const imageUrls = uploadedImages
      .filter((img) => img.uploadedUrl)
      .map((img) => img.uploadedUrl!);

    createReviewMutation.mutate({
      productId,
      rating,
      content,
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
    });
  };

  const hasUploadingImages = uploadedImages.some((img) => img.isUploading);
  const isSubmitDisabled = rating === 0 || createReviewMutation.isPending || !productInfo || hasUploadingImages;

  if (productLoading) {
    return (
      <div className="write-review-page">
        <header className="write-review-page__header">
          <div className="write-review-page__header-spacer" />
          <h1 className="write-review-page__title">리뷰 작성하기</h1>
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
        <h1 className="write-review-page__title">리뷰 작성하기</h1>
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
              onClick={handleImageUploadClick}
              disabled={uploadedImages.length >= MAX_IMAGES || isUploadingImages}
            >
              <ImageUploadIcon />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={handleImageChange}
              className="write-review-page__file-input"
            />
            {uploadedImages.map((image, index) => (
              <div key={index} className="write-review-page__photo-preview">
                <img src={image.previewUrl} alt={`미리보기 ${index + 1}`} />
                {image.isUploading && (
                  <div className="write-review-page__photo-uploading">
                    <div className="write-review-page__photo-spinner" />
                  </div>
                )}
                <button
                  type="button"
                  className="write-review-page__photo-remove-btn"
                  onClick={() => handleRemoveImage(index)}
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
          {createReviewMutation.isPending ? '등록 중...' : '등록'}
        </button>
      </div>

      {createReviewMutation.isError && (
        <div className="write-review-page__error">
          {createReviewMutation.error?.message || '리뷰 작성에 실패했습니다.'}
        </div>
      )}

      {createReviewMutation.isSuccess && (
        <div className="write-review-page__success">
          리뷰가 등록되었습니다.
        </div>
      )}
    </div>
  );
}
