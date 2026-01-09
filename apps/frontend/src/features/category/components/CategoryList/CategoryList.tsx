import { Category } from '../../types/category';
import './CategoryList.css';

interface CategoryListProps {
  categories: Category[];
  isLoading?: boolean;
  onCategoryClick: (category: Category) => void;
}

const SKELETON_COUNT = 5;

export default function CategoryList({ categories, isLoading = false, onCategoryClick }: CategoryListProps) {
  return (
    <div className="category-list">
      {categories.map((category) => (
        <button
          key={category.id}
          className="category-list__item"
          onClick={() => onCategoryClick(category)}
        >
          <span className="category-list__name">{category.name}</span>
        </button>
      ))}
      {isLoading && Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <div key={`skeleton-${index}`} className="category-list__item category-list__item--skeleton">
          <span className="category-list__skeleton-text" />
        </div>
      ))}
    </div>
  );
}
