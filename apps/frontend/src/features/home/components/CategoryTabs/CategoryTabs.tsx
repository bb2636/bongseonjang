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
}

const TABS: TabConfig[] = [
  { id: 'best', label: '베스트' },
  { id: 'new', label: '신상품' },
  { id: 'event', label: '이벤트', isEvent: true },
  { id: 'all', label: '전체상품' },
];

export default function CategoryTabs({ activeTab, onTabChange }: CategoryTabsProps) {
  const isTabActive = (tabId: TabCategoryTab) => {
    return activeTab === tabId;
  };

  return (
    <div className="category-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`category-tabs__tab ${isTabActive(tab.id) ? 'category-tabs__tab--active' : ''} ${tab.isEvent ? 'category-tabs__tab--event' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
