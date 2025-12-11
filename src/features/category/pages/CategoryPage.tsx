import { useCategoryPage } from '../hooks/useCategoryPage';
import CategoryView from '../views/CategoryView';

export default function CategoryPage() {
  const {
    categories,
    handleCategoryClick,
    handleBrandClick,
  } = useCategoryPage();

  return (
    <CategoryView
      categories={categories}
      onCategoryClick={handleCategoryClick}
      onBrandClick={handleBrandClick}
    />
  );
}
