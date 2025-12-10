import { useParams, useNavigate } from 'react-router-dom';
import { useProductDetailPage } from '../hooks/useProductDetailPage';
import ProductDetailView from '../views/ProductDetailView';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    product,
    isLoading,
    error,
    selectedOption,
    quantity,
    isWishlisted,
    totalPrice,
    activeTab,
    reviews,
    reviewsLoading,
    handleOptionSelect,
    handleQuantityChange,
    handleWishlistClick,
    handleCartClick,
    handleBuyClick,
    handleShare,
    handleTabChange,
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

  return (
    <ProductDetailView
      product={product}
      selectedOption={selectedOption}
      quantity={quantity}
      isWishlisted={isWishlisted}
      totalPrice={totalPrice}
      activeTab={activeTab}
      reviews={reviews}
      reviewsLoading={reviewsLoading}
      onOptionSelect={handleOptionSelect}
      onQuantityChange={handleQuantityChange}
      onWishlistClick={handleWishlistClick}
      onCartClick={handleCartClick}
      onBuyClick={handleBuyClick}
      onShare={handleShare}
      onTabChange={handleTabChange}
    />
  );
}
