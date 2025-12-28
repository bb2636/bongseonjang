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
  { id: 'category-11111111-1111-1111-1111-111111111111', name: '제철 수산물', imageUrl: seasonalSeafood },
  { id: 'category-33333333-3333-3333-3333-333333333333', name: '손질 수산물', imageUrl: preparedSeafood },
  { id: 'category-22222222-2222-2222-2222-222222222222', name: '급랭 수산물', imageUrl: expressSeafood },
  { id: 'category-55555555-5555-5555-5555-555555555555', name: '바담은 절임류', imageUrl: pickledSeafood },
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
