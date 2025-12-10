import CategoryProductsAppBar from '../components/CategoryProductsAppBar/CategoryProductsAppBar';
import ProductGrid from '../components/ProductGrid/ProductGrid';
import './CategoryProductsView.css';

interface Product {
  id: number;
  name: string;
  price: number;
  discountRate: number;
  imageUrl: string;
}

interface CategoryProductsViewProps {
  products: Product[];
  isLoading: boolean;
  onProductClick: (productId: number) => void;
  onAddToCart: (productId: number) => void;
  onCartClick: () => void;
  onBack: () => void;
}

export default function CategoryProductsView({
  products,
  isLoading,
  onProductClick,
  onAddToCart,
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
        {isLoading ? (
          <div className="category-products-page__loading">로딩중...</div>
        ) : (
          <ProductGrid 
            products={products}
            onProductClick={onProductClick}
            onAddToCart={onAddToCart}
          />
        )}
      </main>
    </div>
  );
}
