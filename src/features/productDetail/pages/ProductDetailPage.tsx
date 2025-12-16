import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductDetailPage } from '../hooks/useProductDetailPage';
import ProductDetailView from '../views/ProductDetailView';
import { AlertModal } from '../../../components/AlertModal';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { checkPurchase } from '../../orderHistory/api/orderHistoryApi';
import { checkUserReview } from '../../review/api/reviewApi';
import './ProductDetailPage.css';

type ModalType = 'alert' | 'retry' | null;

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [modalState, setModalState] = useState<{ type: ModalType; message: string }>({
    type: null,
    message: '',
  });
  const [isCheckingReviewPermission, setIsCheckingReviewPermission] = useState(false);
  
  const {
    product,
    isLoading,
    error,
    selectedOption,
    quantity,
    totalPrice,
    activeTab,
    reviews,
    reviewsLoading,
    inquiries,
    inquiriesLoading,
    relatedProducts,
    relatedProductsLoading,
    isWishlisted,
    handleOptionSelect,
    handleQuantityChange,
    handleCartClick,
    handleShare,
    handleTabChange,
    handleAddToCart,
    handleToggleWishlist,
    handleWriteInquiryClick,
  } = useProductDetailPage(id || '');

  if (isLoading) {
    return (
      <div className="product-detail-page__loading">
        <div className="product-detail-page__spinner" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page__error">
        <p className="product-detail-page__error-text">
          상품을 찾을 수 없습니다.
        </p>
        <button 
          className="product-detail-page__back-button"
          onClick={() => navigate(-1)}
        >
          돌아가기
        </button>
      </div>
    );
  }

  const handleWriteReviewClick = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }

    if (isCheckingReviewPermission) {
      return;
    }

    setIsCheckingReviewPermission(true);

    try {
      const [purchaseResult, reviewResult] = await Promise.all([
        checkPurchase(id || ''),
        checkUserReview(id || ''),
      ]);

      // TODO: 테스트 후 조건 복원 필요
      // if (!purchaseResult.hasPurchased) {
      //   setModalState({
      //     type: 'alert',
      //     message: '상품 구매 후 리뷰를 작성할 수 있습니다',
      //   });
      //   return;
      // }

      // if (reviewResult.hasReviewed) {
      //   setModalState({
      //     type: 'alert',
      //     message: '이미 리뷰를 작성하셨습니다',
      //   });
      //   return;
      // }

      navigate(`/review/write/${id}`, {
        state: {
          product: {
            id: product.id,
            name: product.name,
            thumbnailUrl: product.thumbnailUrl,
          },
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
        selectedOption={selectedOption}
        quantity={quantity}
        totalPrice={totalPrice}
        activeTab={activeTab}
        reviews={reviews}
        reviewsLoading={reviewsLoading}
        inquiries={inquiries}
        inquiriesLoading={inquiriesLoading}
        relatedProducts={relatedProducts}
        relatedProductsLoading={relatedProductsLoading}
        isWishlisted={isWishlisted}
        onOptionSelect={handleOptionSelect}
        onQuantityChange={handleQuantityChange}
        onCartClick={handleCartClick}
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
