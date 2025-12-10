import { useCategoryPage } from '../hooks/useCategoryPage';
import CategoryView from '../views/CategoryView';

export default function CategoryPage() {
  const {
    categories,
    handleCategoryClick,
    handleBrandClick,
    handleCartClick,
    handleLogoClick,
  } = useCategoryPage();

  return (
    <CategoryView
      categories={categories}
      onCategoryClick={handleCategoryClick}
      onBrandClick={handleBrandClick}
      onCartClick={handleCartClick}
      onLogoClick={handleLogoClick}
    />
  );
}
