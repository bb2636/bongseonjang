import './CategoryTabs.css';

type CategoryTab = 'best' | 'new' | 'event' | 'all';

interface CategoryTabsProps {
  activeTab: CategoryTab;
  onTabChange: (tab: CategoryTab) => void;
}

interface TabConfig {
  id: CategoryTab;
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
  return (
    <div className="category-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`category-tabs__tab ${activeTab === tab.id ? 'category-tabs__tab--active' : ''} ${tab.isEvent ? 'category-tabs__tab--event' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
