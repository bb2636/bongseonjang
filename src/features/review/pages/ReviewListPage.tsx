import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '../../../layouts';
import { fetchPendingReviewItems, ReviewableOrderItemDto } from '../api/reviewApi';
import './ReviewListPage.css';

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

function ReviewCard({ item, onClick }: { item: ReviewableOrderItemDto; onClick: () => void }) {
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

export default function ReviewListPage() {
  const navigate = useNavigate();
  const { data: pendingItems = [], isLoading, isError } = useQuery({
    queryKey: ['pendingReviewItems'],
    queryFn: fetchPendingReviewItems,
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
          <button type="button" className="review-list-page__tab review-list-page__tab--active">리뷰 작성</button>
          <button type="button" className="review-list-page__tab review-list-page__tab--inactive">나의 리뷰</button>
        </div>

        <div className="review-list-page__summary">작성 가능한 리뷰 {pendingItems.length.toString().padStart(2, '0')}</div>

        {isLoading && <div className="review-list-page__state">불러오는 중...</div>}
        {isError && <div className="review-list-page__state review-list-page__state--error">리뷰 목록을 불러오지 못했습니다.</div>}

        {!isLoading && !isError && pendingItems.length === 0 && (
          <div className="review-list-page__state">작성할 수 있는 리뷰가 없습니다.</div>
        )}

        <div className="review-list-page__list">
          {pendingItems.map((item) => (
            <ReviewCard key={item.orderItemId} item={item} onClick={() => handleWriteClick(item)} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
