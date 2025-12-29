import { AppBar } from '@/components/AppBar';
import { CategoryTabs } from '../components/CategoryTabs';
import { FilterChips } from '../../home/components/FilterChips';
import { ProductGridContent } from '@/components/ProductGridContent';
import type { ProductCardData } from '@/components/ProductCard';
import './CategoryProductsView.css';

interface SubCategory {
  id: string;
  label: string;
}

interface CategoryProductsViewProps {
  activeSlug: string;
  products: ProductCardData[];
  isLoading: boolean;
  error: Error | null;
  showFilterChips: boolean;
  subCategories: SubCategory[];
  selectedSubCategory: string;
  onTabChange: (slug: string) => void;
  onSubCategoryChange: (categoryId: string) => void;
  onProductClick: (productId: string) => void;
  onCartClick: () => void;
  onBack: () => void;
  onLogoClick: () => void;
}

export default function CategoryProductsView({
  activeSlug,
  products,
  isLoading,
  error,
  showFilterChips,
  subCategories,
  selectedSubCategory,
  onTabChange,
  onSubCategoryChange,
  onProductClick,
  onCartClick,
  onBack,
}: CategoryProductsViewProps) {
  return (
    <div className="category-products-page">
      <AppBar 
        showBackButton
        onBackClick={onBack}
        showLogo={false}
        onCartClick={onCartClick}
      />
      <CategoryTabs 
        activeSlug={activeSlug}
        onTabChange={onTabChange}
      />
      {showFilterChips && (
        <FilterChips
          chips={subCategories}
          selectedChipId={selectedSubCategory}
          onChipSelect={onSubCategoryChange}
        />
      )}
      <main className="category-products-page__content">
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
