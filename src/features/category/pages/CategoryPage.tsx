import { useCategoryPage } from '../hooks/useCategoryPage';
import CategoryView from '../views/CategoryView';

export default function CategoryPage() {
  const {
    categories,
    handleCategoryClick,
    handleCartClick,
    handleLogoClick,
  } = useCategoryPage();

  return (
    <CategoryView
      categories={categories}
      onCategoryClick={handleCategoryClick}
      onCartClick={handleCartClick}
      onLogoClick={handleLogoClick}
    />
  );
}
