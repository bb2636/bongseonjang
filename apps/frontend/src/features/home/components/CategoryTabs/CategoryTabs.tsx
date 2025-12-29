import { Link, useLocation } from 'react-router-dom';
import type { CategoryTab } from '../../types/navigation';
import './CategoryTabs.css';

interface CategoryTabsProps {
  activeTab: CategoryTab;
  onTabChange: (tab: CategoryTab) => void;
}

type TabCategoryTab = 'best' | 'new' | 'event' | 'all';

interface TabConfig {
  id: TabCategoryTab;
  label: string;
  isEvent?: boolean;
  linkTo?: string;
}

const TABS: TabConfig[] = [
  { id: 'best', label: '베스트', linkTo: '/category/best' },
  { id: 'new', label: '신상품', linkTo: '/category/new' },
  { id: 'event', label: '이벤트', isEvent: true },
  { id: 'all', label: '전체상품', linkTo: '/category/all' },
];

export default function CategoryTabs({ activeTab, onTabChange }: CategoryTabsProps) {
  const location = useLocation();

  const isTabActive = (tabId: TabCategoryTab) => {
    return activeTab === tabId;
  };

  return (
    <div className="category-tabs">
      {TABS.map((tab) => {
        if (tab.linkTo) {
          return (
            <Link
              key={tab.id}
              to={tab.linkTo}
              className={`category-tabs__tab ${location.pathname === tab.linkTo ? 'category-tabs__tab--active' : ''} ${tab.isEvent ? 'category-tabs__tab--event' : ''}`}
            >
              {tab.label}
            </Link>
          );
        }
        return (
          <button
            key={tab.id}
            type="button"
            className={`category-tabs__tab ${isTabActive(tab.id) ? 'category-tabs__tab--active' : ''} ${tab.isEvent ? 'category-tabs__tab--event' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
