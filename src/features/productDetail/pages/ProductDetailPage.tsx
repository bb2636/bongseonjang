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
    totalPrice,
    activeTab,
    reviews,
    reviewsLoading,
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

  const handleWriteReviewClick = () => {
    navigate(`/review/write/${id}`, {
      state: {
        product: {
          id: product.id,
          name: product.name,
          thumbnailUrl: product.thumbnailUrl,
        },
      },
    });
  };

  return (
    <ProductDetailView
      product={product}
      selectedOption={selectedOption}
      quantity={quantity}
      totalPrice={totalPrice}
      activeTab={activeTab}
      reviews={reviews}
      reviewsLoading={reviewsLoading}
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
    />
  );
}
