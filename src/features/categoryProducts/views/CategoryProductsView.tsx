import CategoryProductsAppBar from '../components/CategoryProductsAppBar/CategoryProductsAppBar';
import { ProductGridContent } from '@/components/ProductGridContent';
import type { ProductCardData } from '@/components/ProductCard';
import './CategoryProductsView.css';

interface CategoryProductsViewProps {
  products: ProductCardData[];
  isLoading: boolean;
  error: Error | null;
  onProductClick: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  onToggleFavorite: (productId: string) => void;
  onCartClick: () => void;
  onBack: () => void;
}

export default function CategoryProductsView({
  products,
  isLoading,
  error,
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
