import CategoryAppBar from '../components/CategoryAppBar';
import CategoryList from '../components/CategoryList';
import BottomNav from '../../../components/BottomNav/BottomNav';
import { Category } from '../types/category';
import './CategoryView.css';

interface CategoryViewProps {
  categories: Category[];
  onCategoryClick: (category: Category) => void;
  onCartClick: () => void;
  onLogoClick: () => void;
}

export default function CategoryView({
  categories,
  onCategoryClick,
  onCartClick,
  onLogoClick,
}: CategoryViewProps) {
  return (
    <div className="category-page">
      <CategoryAppBar 
        onCartClick={onCartClick}
        onLogoClick={onLogoClick}
      />
      
      <main className="category-page__content">
        <div className="category-page__header">
          <h1 className="category-page__title">카테고리</h1>
        </div>
        <CategoryList 
          categories={categories}
          onCategoryClick={onCategoryClick}
        />
      </main>

      <BottomNav />
    </div>
  );
}
