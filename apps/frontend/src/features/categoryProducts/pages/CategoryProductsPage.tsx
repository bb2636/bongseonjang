import { useCategoryProductsPage } from '../hooks/useCategoryProductsPage';
import CategoryProductsView from '../views/CategoryProductsView';

export default function CategoryProductsPage() {
  const { state, actions } = useCategoryProductsPage();

  return (
    <CategoryProductsView
      activeSlug={state.activeSlug}
      products={state.products}
      isLoading={state.isLoading}
      error={state.error}
      showFilterChips={state.showFilterChips}
      subCategories={state.subCategories}
      selectedSubCategory={state.selectedSubCategory}
      onTabChange={actions.handleTabChange}
      onSubCategoryChange={actions.handleSubCategoryChange}
      onProductClick={actions.handleProductClick}
      onCartClick={actions.handleCartClick}
      onBack={actions.handleBack}
      onLogoClick={actions.handleLogoClick}
    />
  );
}
