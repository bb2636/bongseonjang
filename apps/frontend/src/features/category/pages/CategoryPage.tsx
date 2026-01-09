import { useEffect } from 'react';
import { useCategoryPage } from '../hooks/useCategoryPage';
import CategoryView from '../views/CategoryView';

export default function CategoryPage() {
  const { state, actions } = useCategoryPage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <CategoryView
      categories={state.categories}
      isLoading={state.isLoading}
      onCategoryClick={actions.handleCategoryClick}
      onBrandClick={actions.handleBrandClick}
    />
  );
}
