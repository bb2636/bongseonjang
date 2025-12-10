import { useCategoryProductsPage } from '../hooks/useCategoryProductsPage';
import CategoryProductsView from '../views/CategoryProductsView';

export default function CategoryProductsPage() {
  const {
    activeCategory,
    categories,
    products,
    isLoading,
    handleCategoryChange,
    handleProductClick,
    handleAddToCart,
    handleCartClick,
    handleBack,
  } = useCategoryProductsPage();

  return (
    <CategoryProductsView
      activeCategory={activeCategory}
      categories={categories}
      products={products}
      isLoading={isLoading}
      onCategoryChange={handleCategoryChange}
      onProductClick={handleProductClick}
      onAddToCart={handleAddToCart}
      onCartClick={handleCartClick}
      onBack={handleBack}
    />
  );
}
