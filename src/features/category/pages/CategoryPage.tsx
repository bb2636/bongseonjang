import { useCategoryPage } from '../hooks/useCategoryPage';
import CategoryView from '../views/CategoryView';

export default function CategoryPage() {
  const { state, actions } = useCategoryPage();

  return (
    <CategoryView
      categories={state.categories}
      onCategoryClick={actions.handleCategoryClick}
      onBrandClick={actions.handleBrandClick}
    />
  );
}
