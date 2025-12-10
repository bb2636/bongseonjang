import { useCategoryProductsPage } from '../hooks/useCategoryProductsPage';
import CategoryProductsView from '../views/CategoryProductsView';

export default function CategoryProductsPage() {
  const {
    products,
    isLoading,
    handleProductClick,
    handleAddToCart,
    handleCartClick,
    handleBack,
  } = useCategoryProductsPage();

  return (
    <CategoryProductsView
      products={products}
      isLoading={isLoading}
      onProductClick={handleProductClick}
      onAddToCart={handleAddToCart}
      onCartClick={handleCartClick}
      onBack={handleBack}
    />
  );
}
