import CategoryProductsAppBar from '../components/CategoryProductsAppBar/CategoryProductsAppBar';
import CategoryTabs from '../components/CategoryTabs/CategoryTabs';
import ProductGrid from '../components/ProductGrid/ProductGrid';
import { Category } from '../../category/types/category';
import './CategoryProductsView.css';

interface Product {
  id: number;
  name: string;
  price: number;
  discountRate: number;
  imageUrl: string;
}

interface CategoryProductsViewProps {
  activeCategory: string;
  categories: Category[];
  products: Product[];
  isLoading: boolean;
  onCategoryChange: (slug: string) => void;
  onProductClick: (productId: number) => void;
  onAddToCart: (productId: number) => void;
  onCartClick: () => void;
  onBack: () => void;
}

export default function CategoryProductsView({
  activeCategory,
  categories,
  products,
  isLoading,
  onCategoryChange,
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
      <CategoryTabs 
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
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
