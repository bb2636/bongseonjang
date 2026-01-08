import { AppBar, AppBarSpacer } from '@/components/AppBar';
import { BrandTabs } from '../components/BrandTabs';
import { ProductGridContent } from '@/components/ProductGridContent';
import type { ProductCardData } from '@/components/ProductCard';
import './BrandProductsView.css';

interface BrandProductsViewProps {
  activeBrandId: string;
  products: ProductCardData[];
  isLoading: boolean;
  error: Error | null;
  onBrandChange: (brandId: string) => void;
  onProductClick: (productId: string) => void;
  onCartClick: () => void;
  onBack: () => void;
}

export default function BrandProductsView({
  activeBrandId,
  products,
  isLoading,
  error,
  onBrandChange,
  onProductClick,
  onCartClick,
  onBack,
}: BrandProductsViewProps) {
  return (
    <div className="brand-products-page">
      <AppBar 
        variant="subpage"
        showBackButton
        onBackClick={onBack}
        showLogo={false}
        onCartClick={onCartClick}
      />
      <AppBarSpacer variant="subpage" />
      <BrandTabs 
        activeBrandId={activeBrandId}
        onBrandChange={onBrandChange}
      />
      <main className="brand-products-page__content">
        <ProductGridContent
          products={products}
          isLoading={isLoading}
          error={error}
          onProductClick={onProductClick}
        />
      </main>
    </div>
  );
}
