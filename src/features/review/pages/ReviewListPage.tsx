import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '../../../layouts';
import { fetchPendingReviewItems, fetchMyReviews, ReviewableOrderItemDto, MyReviewDto } from '../api/reviewApi';
import './ReviewListPage.css';

type TabType = 'pending' | 'my';

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 18L9 12L15 6" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9H20L18.5 21H7.5L6 9Z" stroke="#0C0C0C" strokeWidth="1.5" />
      <path d="M10 11V8.5C10 6.567 11.567 5 13.5 5C15.433 5 17 6.567 17 8.5V11" stroke="#0C0C0C" strokeWidth="1.5" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill={filled ? "#FFB800" : "none"} xmlns="http://www.w3.org/2000/svg">
      <path d="M7 1L8.854 4.854L13 5.5L10 8.5L10.708 13L7 11L3.292 13L4 8.5L1 5.5L5.146 4.854L7 1Z" stroke="#FFB800" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PendingReviewCard({ item, onClick }: { item: ReviewableOrderItemDto; onClick: () => void }) {
  return (
    <div className="review-card">
      <div className="review-card__thumbnail">
        {item.productImageUrl ? (
          <img src={item.productImageUrl} alt={item.productName} />
        ) : (
          <div className="review-card__placeholder" />
        )}
      </div>
      <div className="review-card__body">
        <div className="review-card__date">구매일자 {item.purchaseDate}</div>
        <div className="review-card__title">{item.productName}</div>
        {item.optionName && <div className="review-card__option">{item.optionName}</div>}
        <button type="button" className="review-card__cta" onClick={onClick}>
          리뷰 작성
        </button>
      </div>
    </div>
  );
}

function MyReviewCard({ review }: { review: MyReviewDto }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="my-review-card">
      <div className="my-review-card__header">
        <div className="my-review-card__product-name">{review.productName}</div>
        <div className="my-review-card__date">{formatDate(review.createdAt)}</div>
      </div>
      <div className="my-review-card__rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon key={star} filled={star <= review.rating} />
        ))}
      </div>
      <div className="my-review-card__content">{review.content}</div>
      {review.imageUrls.length > 0 && (
        <div className="my-review-card__images">
          {review.imageUrls.map((url, index) => (
            <img key={index} src={url} alt={`리뷰 이미지 ${index + 1}`} className="my-review-card__image" />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReviewListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('pending');

  const { data: pendingItems = [], isLoading: isPendingLoading, isError: isPendingError } = useQuery({
    queryKey: ['pendingReviewItems'],
    queryFn: fetchPendingReviewItems,
  });

  const { data: myReviews = [], isLoading: isMyReviewsLoading, isError: isMyReviewsError } = useQuery({
    queryKey: ['myReviews'],
    queryFn: fetchMyReviews,
  });

  const handleWriteClick = (item: ReviewableOrderItemDto) => {
    if (!item.productId) {
      return;
    }

    navigate(`/review/write/${item.productId}`, {
      state: {
        product: {
          id: item.productId,
          name: item.productName,
          thumbnailUrl: item.productImageUrl || undefined,
        },
        orderItemId: item.orderItemId,
      },
    });
  };

  const isLoading = activeTab === 'pending' ? isPendingLoading : isMyReviewsLoading;
  const isError = activeTab === 'pending' ? isPendingError : isMyReviewsError;

  return (
    <MainLayout>
      <div className="review-list-page">
        <header className="review-list-page__header">
          <button type="button" className="review-list-page__icon-btn" onClick={() => navigate(-1)} aria-label="뒤로가기">
            <BackIcon />
          </button>
          <h1 className="review-list-page__title">상품 리뷰</h1>
          <button type="button" className="review-list-page__icon-btn" onClick={() => navigate('/cart')} aria-label="장바구니">
            <div className="review-list-page__bag-wrapper">
              <BagIcon />
              {pendingItems.length > 0 && (
                <span className="review-list-page__badge">{pendingItems.length}</span>
              )}
            </div>
          </button>
        </header>

        <div className="review-list-page__tabs">
          <button
            type="button"
            className={`review-list-page__tab ${activeTab === 'pending' ? 'review-list-page__tab--active' : 'review-list-page__tab--inactive'}`}
            onClick={() => setActiveTab('pending')}
          >
            리뷰 작성
          </button>
          <button
            type="button"
            className={`review-list-page__tab ${activeTab === 'my' ? 'review-list-page__tab--active' : 'review-list-page__tab--inactive'}`}
            onClick={() => setActiveTab('my')}
          >
            나의 리뷰
          </button>
        </div>

        {activeTab === 'pending' && (
          <>
            <div className="review-list-page__summary">작성 가능한 리뷰 {pendingItems.length.toString().padStart(2, '0')}</div>

            {isLoading && <div className="review-list-page__state">불러오는 중...</div>}
            {isError && <div className="review-list-page__state review-list-page__state--error">리뷰 목록을 불러오지 못했습니다.</div>}

            {!isLoading && !isError && pendingItems.length === 0 && (
              <div className="review-list-page__state">작성할 수 있는 리뷰가 없습니다.</div>
            )}

            <div className="review-list-page__list">
              {pendingItems.map((item) => (
                <PendingReviewCard key={item.orderItemId} item={item} onClick={() => handleWriteClick(item)} />
              ))}
            </div>
          </>
        )}

        {activeTab === 'my' && (
          <>
            <div className="review-list-page__summary">작성한 리뷰 {myReviews.length.toString().padStart(2, '0')}</div>

            {isLoading && <div className="review-list-page__state">불러오는 중...</div>}
            {isError && <div className="review-list-page__state review-list-page__state--error">리뷰 목록을 불러오지 못했습니다.</div>}

            {!isLoading && !isError && myReviews.length === 0 && (
              <div className="review-list-page__state">작성한 리뷰가 없습니다.</div>
            )}

            <div className="review-list-page__list">
              {myReviews.map((review) => (
                <MyReviewCard key={review.id} review={review} />
              ))}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
