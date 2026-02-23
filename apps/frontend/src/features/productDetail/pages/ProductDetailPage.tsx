import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGoBack } from '../../../hooks/useGoBack';
import { useProductDetailPage } from '../hooks/useProductDetailPage';
import ProductDetailView from '../views/ProductDetailView';
import ProductDetailSkeleton from '../components/ProductDetailSkeleton';
import { AlertModal } from '../../../components/AlertModal';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { checkUserReview } from '../../review/api/reviewApi';
import './ProductDetailPage.css';

type ModalType = 'alert' | 'retry' | null;

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [modalState, setModalState] = useState<{ type: ModalType; message: string }>({
    type: null,
    message: '',
  });
  const [isCheckingReviewPermission, setIsCheckingReviewPermission] = useState(false);
  
  const { state, actions } = useProductDetailPage(id || '');
  const {
    product,
    isLoading,
    error,
    activeTab,
    reviews,
    reviewsLoading,
    inquiries,
    inquiriesLoading,
    relatedProducts,
    relatedProductsLoading,
    isWishlisted,
    isSoldOut,
  } = state;
  const {
    handleTabChange,
    handleAddToCart,
    handleToggleWishlist,
    handleWriteInquiryClick,
    handleShare,
  } = actions;

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="product-detail-page__error">
        <p className="product-detail-page__error-text">
          상품을 찾을 수 없습니다.
        </p>
        <button 
          className="product-detail-page__back-button"
          onClick={goBack}
        >
          돌아가기
        </button>
      </div>
    );
  }

  const handleWriteReviewClick = async () => {
    const token = localStorage.getItem('user_token');
    
    if (!token) {
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }

    if (isCheckingReviewPermission) {
      return;
    }

    setIsCheckingReviewPermission(true);

    try {
      const reviewResult = await checkUserReview(id || '');

      if (!reviewResult.canReview) {
        if (reviewResult.reason === 'not_purchased') {
          setModalState({
            type: 'alert',
            message: '상품 구매 후 리뷰를 작성할 수 있습니다',
          });
          return;
        }
        if (reviewResult.reason === 'already_reviewed') {
          setModalState({
            type: 'alert',
            message: '이미 리뷰를 작성하셨습니다',
          });
          return;
        }
      }

      navigate(`/review/write/${id}`, {
        state: {
          product: {
            id: product.id,
            name: product.name,
            thumbnailUrl: product.thumbnailUrl,
          },
          orderItemId: reviewResult.orderItemId,
        },
      });
    } catch (error) {
      console.error('Error checking review permission:', error);
      setModalState({
        type: 'retry',
        message: '일시적인 오류가 발생했습니다. 다시 시도하시겠습니까?',
      });
    } finally {
      setIsCheckingReviewPermission(false);
    }
  };

  const handleModalClose = () => {
    setModalState({ type: null, message: '' });
  };

  const handleRetryConfirm = () => {
    setModalState({ type: null, message: '' });
    handleWriteReviewClick();
  };

  return (
    <>
      <ProductDetailView
        product={product}
        activeTab={activeTab}
        reviews={reviews}
        reviewsLoading={reviewsLoading}
        inquiries={inquiries}
        inquiriesLoading={inquiriesLoading}
        relatedProducts={relatedProducts}
        relatedProductsLoading={relatedProductsLoading}
        isWishlisted={isWishlisted}
        isSoldOut={isSoldOut}
        onShare={handleShare}
        onTabChange={handleTabChange}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        onWriteReviewClick={handleWriteReviewClick}
        onWriteInquiryClick={handleWriteInquiryClick}
      />
      <AlertModal
        isOpen={modalState.type === 'alert'}
        title={modalState.message}
        onConfirm={handleModalClose}
      />
      <ConfirmModal
        isOpen={modalState.type === 'retry'}
        title={modalState.message}
        onCancel={handleModalClose}
        onConfirm={handleRetryConfirm}
        cancelText="취소"
        confirmText="다시 시도"
      />
    </>
  );
}
