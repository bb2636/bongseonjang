import { useEffect, useState } from 'react';
import { apiClient } from '../../../../services/apiClient';
import './CategoryTabs.css';

interface CategoryTab {
  id: string;
  slug: string;
  name: string;
}

interface ApiCategory {
  id: string;
  name: string;
  sortOrder: number;
}

const STATIC_TABS: CategoryTab[] = [
  { id: 'all', slug: 'all', name: '전체' },
  { id: 'best', slug: 'best', name: '베스트' },
  { id: 'new', slug: 'new', name: '신상품' },
];

interface CategoryTabsProps {
  activeSlug: string;
  onTabChange: (slug: string, categoryId?: string) => void;
}

export default function CategoryTabs({ activeSlug, onTabChange }: CategoryTabsProps) {
  const [dynamicCategories, setDynamicCategories] = useState<CategoryTab[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await apiClient.get<ApiCategory[]>('/products/categories');
        const brandCategoryNames = ['바담은', '봉쿡', '포시즌', '온바다'];
        const mapped = categories
          .filter((cat) => !brandCategoryNames.includes(cat.name))
          .map((cat) => ({
            id: cat.id,
            slug: cat.id,
            name: cat.name,
          }));
        setDynamicCategories(mapped);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const allTabs = [...STATIC_TABS, ...dynamicCategories];
  const staticSlugs = ['all', 'best', 'new'];

  const handleTabClick = (tab: CategoryTab) => {
    if (!staticSlugs.includes(tab.slug)) {
      onTabChange(tab.slug, tab.id);
    } else {
      onTabChange(tab.slug);
    }
  };

  return (
    <div className="category-tabs">
      <div className="category-tabs__container">
        {allTabs.map((tab) => (
          <button
            key={tab.slug}
            type="button"
            className={`category-tabs__item ${activeSlug === tab.slug ? 'category-tabs__item--active' : ''}`}
            onClick={() => handleTabClick(tab)}
          >
            {tab.name}
          </button>
        ))}
      </div>
    </div>
  );
}
