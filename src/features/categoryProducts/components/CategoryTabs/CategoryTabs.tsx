import './CategoryTabs.css';

interface CategoryTab {
  slug: string;
  name: string;
}

const CATEGORY_TABS: CategoryTab[] = [
  { slug: 'all', name: '전체' },
  { slug: 'new', name: '신상품' },
  { slug: 'best', name: '베스트' },
  { slug: 'seasonal', name: '제철수산물' },
  { slug: 'frozen', name: '급랭수산물' },
  { slug: 'prepared', name: '손질 수산물' },
  { slug: 'pickled', name: '바담은 절임류' },
];

interface CategoryTabsProps {
  activeSlug: string;
  onTabChange: (slug: string) => void;
}

export default function CategoryTabs({ activeSlug, onTabChange }: CategoryTabsProps) {
  return (
    <div className="category-tabs">
      <div className="category-tabs__container">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.slug}
            type="button"
            className={`category-tabs__item ${activeSlug === tab.slug ? 'category-tabs__item--active' : ''}`}
            onClick={() => onTabChange(tab.slug)}
          >
            {tab.name}
          </button>
        ))}
      </div>
    </div>
  );
}
