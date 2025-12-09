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
  { id: 'seasonal', name: '제철 수산물' },
  { id: 'prepared', name: '손질 수산물' },
  { id: 'frozen', name: '급랭 수산물' },
  { id: 'pickled', name: '바담은 절임류' },
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
                <img src={category.imageUrl} alt={category.name} />
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
