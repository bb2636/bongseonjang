import { useBrandProductsPage } from '../hooks/useBrandProductsPage';
import BrandProductsView from '../views/BrandProductsView';

export default function BrandProductsPage() {
  const { state, actions } = useBrandProductsPage();

  return (
    <BrandProductsView
      activeBrandId={state.activeBrandId}
      products={state.products}
      isLoading={state.isLoading}
      error={state.error}
      onBrandChange={actions.handleBrandChange}
      onProductClick={actions.handleProductClick}
      onCartClick={actions.handleCartClick}
      onBack={actions.handleBack}
    />
  );
}
