import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/shared/config/apiConfig';
import './ReviewDetailPanel.css';

interface ReviewImage {
  id: string;
  imageUrl: string;
}

interface ReviewDetail {
  id: string;
  productId: string;
  productName: string | null;
  productThumbnail: string | null;
  userId: string;
  userName: string | null;
  rating: number;
  content: string;
  images: ReviewImage[];
  createdAt: string;
}

interface ReviewDetailPanelProps {
  reviewId: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (reviewId: string) => void;
}

function renderStars(rating: number) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={i <= rating ? 'review-detail-panel__star review-detail-panel__star--filled' : 'review-detail-panel__star'}>★</span>
    );
  }
  return stars;
}

export function ReviewDetailPanel({ reviewId, isOpen, onClose, onDelete }: ReviewDetailPanelProps) {
  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && reviewId) {
      fetchReviewDetail();
    }
  }, [isOpen, reviewId]);

  const fetchReviewDetail = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/reviews/${reviewId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setReview(data);
      }
    } catch (error) {
      console.error('Failed to fetch review detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="review-detail-panel__overlay" onClick={onClose} />
      <div className="review-detail-panel">
        <div className="review-detail-panel__header">
          <button className="review-detail-panel__back-button" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="#292929" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="review-detail-panel__back-text">목록으로</span>
        </div>

        {isLoading ? (
          <div className="review-detail-panel__loading">로딩 중...</div>
        ) : review ? (
          <>
            <div className="review-detail-panel__content">
              <div className="review-detail-panel__section">
                <div className="review-detail-panel__section-title">상품 정보</div>
                <div className="review-detail-panel__product-info">
                  {review.productThumbnail ? (
                    <img
                      src={review.productThumbnail}
                      alt={review.productName || ''}
                      className="review-detail-panel__product-thumbnail"
                    />
                  ) : (
                    <div className="review-detail-panel__product-thumbnail review-detail-panel__product-thumbnail--placeholder" />
                  )}
                  <span className="review-detail-panel__product-name">{review.productName || '-'}</span>
                </div>
              </div>

              <div className="review-detail-panel__section">
                <div className="review-detail-panel__section-title">작성자</div>
                <div className="review-detail-panel__value">{review.userName || '-'}</div>
              </div>

              <div className="review-detail-panel__section">
                <div className="review-detail-panel__section-title">별점</div>
                <div className="review-detail-panel__rating">
                  {renderStars(review.rating)}
                  <span className="review-detail-panel__rating-text">{review.rating}점</span>
                </div>
              </div>

              <div className="review-detail-panel__section">
                <div className="review-detail-panel__section-title">리뷰 내용</div>
                <div className="review-detail-panel__review-content">{review.content}</div>
              </div>

              {review.images.length > 0 && (
                <div className="review-detail-panel__section">
                  <div className="review-detail-panel__section-title">리뷰 이미지</div>
                  <div className="review-detail-panel__images-grid">
                    {review.images.map((img) => (
                      <img
                        key={img.id}
                        src={img.imageUrl}
                        alt=""
                        className="review-detail-panel__image"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="review-detail-panel__section">
                <div className="review-detail-panel__section-title">작성일</div>
                <div className="review-detail-panel__value">{formatDate(review.createdAt)}</div>
              </div>
            </div>

            <div className="review-detail-panel__footer">
              <button
                className="review-detail-panel__delete-button"
                onClick={() => onDelete(review.id)}
              >
                리뷰 삭제
              </button>
            </div>
          </>
        ) : (
          <div className="review-detail-panel__error">리뷰 정보를 불러올 수 없습니다.</div>
        )}
      </div>
    </>
  );
}
