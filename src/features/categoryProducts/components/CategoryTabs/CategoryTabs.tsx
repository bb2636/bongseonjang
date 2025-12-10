import { useRef, useEffect } from 'react';
import { Category } from '../../../category/types/category';
import './CategoryTabs.css';

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
}

export default function CategoryTabs({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}: CategoryTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeTabRef.current && tabsRef.current) {
      const tabsContainer = tabsRef.current;
      const activeTab = activeTabRef.current;
      const containerWidth = tabsContainer.offsetWidth;
      const tabLeft = activeTab.offsetLeft;
      const tabWidth = activeTab.offsetWidth;
      const scrollLeft = tabLeft - (containerWidth / 2) + (tabWidth / 2);
      tabsContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeCategory]);

  return (
    <div className="category-tabs" ref={tabsRef}>
      {categories.map((category) => (
        <button
          key={category.id}
          ref={category.slug === activeCategory ? activeTabRef : null}
          className={`category-tabs__tab ${category.slug === activeCategory ? 'category-tabs__tab--active' : ''}`}
          onClick={() => onCategoryChange(category.slug)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
