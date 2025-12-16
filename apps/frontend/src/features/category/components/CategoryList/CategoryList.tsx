import { Category } from '../../types/category';
import './CategoryList.css';

interface CategoryListProps {
  categories: Category[];
  onCategoryClick: (category: Category) => void;
}

export default function CategoryList({ categories, onCategoryClick }: CategoryListProps) {
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
    </div>
  );
}
