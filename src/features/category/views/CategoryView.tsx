import CategoryAppBar from '../components/CategoryAppBar';
import CategoryList from '../components/CategoryList';
import { CategoryCardGrid } from '../components/CategoryCardGrid';
import BottomNav from '../../../components/BottomNav/BottomNav';
import { Category } from '../types/category';
import './CategoryView.css';
import { AppBar } from '@/components/AppBar';

interface CategoryViewProps {
  categories: Category[];
  onCategoryClick: (category: Category) => void;
  onBrandClick: (brandId: string) => void;
  onCartClick: () => void;
  onLogoClick: () => void;
}

export default function CategoryView({
  categories,
  onCategoryClick,
  onBrandClick,
  onCartClick,
  onLogoClick,
}: CategoryViewProps) {
  return (
    <div className="category-page">
      <AppBar></AppBar>
      
      <main className="category-page__content">
        <div className="category-page__header">
          <h1 className="category-page__title">카테고리</h1>
        </div>
        <CategoryList 
          categories={categories}
          onCategoryClick={onCategoryClick}
        />
        
        <CategoryCardGrid onCardClick={onBrandClick} />
      </main>

      <BottomNav />
    </div>
  );
}
