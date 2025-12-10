import { useCategoryProductsPage } from '../hooks/useCategoryProductsPage';
import CategoryProductsView from '../views/CategoryProductsView';

export default function CategoryProductsPage() {
  const {
    products,
    isLoading,
    error,
    handleProductClick,
    handleAddToCart,
    handleToggleFavorite,
    handleCartClick,
    handleBack,
  } = useCategoryProductsPage();

  return (
    <CategoryProductsView
      products={products}
      isLoading={isLoading}
      error={error}
      onProductClick={handleProductClick}
      onAddToCart={handleAddToCart}
      onToggleFavorite={handleToggleFavorite}
      onCartClick={handleCartClick}
      onBack={handleBack}
    />
  );
}
