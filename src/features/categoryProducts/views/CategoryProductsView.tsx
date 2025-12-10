import CategoryProductsAppBar from '../components/CategoryProductsAppBar/CategoryProductsAppBar';
import { CategoryTabs } from '../components/CategoryTabs';
import { ProductGridContent } from '@/components/ProductGridContent';
import type { ProductCardData } from '@/components/ProductCard';
import './CategoryProductsView.css';

interface CategoryProductsViewProps {
  activeSlug: string;
  products: ProductCardData[];
  isLoading: boolean;
  error: Error | null;
  onTabChange: (slug: string) => void;
  onProductClick: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  onToggleFavorite: (productId: string) => void;
  onCartClick: () => void;
  onBack: () => void;
}

export default function CategoryProductsView({
  activeSlug,
  products,
  isLoading,
  error,
  onTabChange,
  onProductClick,
  onAddToCart,
  onToggleFavorite,
  onCartClick,
  onBack,
}: CategoryProductsViewProps) {
  return (
    <div className="category-products-page">
      <CategoryProductsAppBar 
        onCartClick={onCartClick}
        onBack={onBack}
      />
      <CategoryTabs 
        activeSlug={activeSlug}
        onTabChange={onTabChange}
      />
      <main className="category-products-page__content">
        <ProductGridContent
          products={products}
          isLoading={isLoading}
          error={error}
          onAddToCart={onAddToCart}
          onToggleFavorite={onToggleFavorite}
          onProductClick={onProductClick}
        />
      </main>
    </div>
  );
}
