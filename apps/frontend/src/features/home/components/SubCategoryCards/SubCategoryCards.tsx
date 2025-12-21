import seasonalSeafood from '@/assets/image/home/seasonal-seafood.svg';
import preparedSeafood from '@/assets/image/home/prepared-seafood.svg';
import expressSeafood from '@/assets/image/home/express-seafood.svg';
import pickledSeafood from '@/assets/image/home/pickled-seafood.svg';
import './SubCategoryCards.css';

interface SubCategory {
  id: string;
  name: string;
  imageUrl?: string;
}

interface SubCategoryCardsProps {
  categories?: SubCategory[];
  onCategoryClick?: (categoryId: string) => void;
}

const DEFAULT_CATEGORIES: SubCategory[] = [
  { id: 'seasonal', name: '제철 수산물', imageUrl: seasonalSeafood },
  { id: 'prepared', name: '손질 수산물', imageUrl: preparedSeafood },
  { id: 'frozen', name: '급랭 수산물', imageUrl: expressSeafood },
  { id: 'pickled', name: '바담은 절임류', imageUrl: pickledSeafood },
];

export default function SubCategoryCards({ 
  categories = DEFAULT_CATEGORIES, 
  onCategoryClick 
}: SubCategoryCardsProps) {
  return (
    <div className="sub-category-section">
      <div className="sub-category-cards">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className="sub-category-card"
            onClick={() => onCategoryClick?.(category.id)}
          >
            <div className="sub-category-card__image">
              {category.imageUrl && (
                <img src={category.imageUrl} alt={category.name} loading="lazy" />
              )}
            </div>
            <span className="sub-category-card__name">{category.name}</span>
          </button>
        ))}
      </div>
      <div className="sub-category-section__divider" />
    </div>
  );
}
