import { AppBar, AppBarSpacer } from '@/components/AppBar';
import { CategoryTabs, CategoryTabsSpacer } from '../components/CategoryTabs';
import { FilterChips } from '../../home/components/FilterChips';
import { ProductGridContent } from '@/components/ProductGridContent';
import BottomNav from '@/components/BottomNav/BottomNav';
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
        variant="subpage"
        showBackButton
        onBackClick={onBack}
        showLogo={false}
        onCartClick={onCartClick}
      />
      <AppBarSpacer variant="subpage" />
      <CategoryTabs 
        activeSlug={activeSlug}
        onTabChange={onTabChange}
      />
      <CategoryTabsSpacer />
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
      <BottomNav />
    </div>
  );
}
