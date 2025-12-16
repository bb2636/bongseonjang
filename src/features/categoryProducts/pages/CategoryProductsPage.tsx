import { useCategoryProductsPage } from '../hooks/useCategoryProductsPage';
import CategoryProductsView from '../views/CategoryProductsView';

export default function CategoryProductsPage() {
  const {
    activeSlug,
    products,
    isLoading,
    error,
    handleTabChange,
    handleProductClick,
    handleCartClick,
    handleBack,
    handleLogoClick,
  } = useCategoryProductsPage();

  return (
    <CategoryProductsView
      activeSlug={activeSlug}
      products={products}
      isLoading={isLoading}
      error={error}
      onTabChange={handleTabChange}
      onProductClick={handleProductClick}
      onCartClick={handleCartClick}
      onBack={handleBack}
      onLogoClick={handleLogoClick}
    />
  );
}
