import { OrderStatusFilter } from '../api/orderHistoryApi';
import './OrderStatusTabs.css';

interface Tab {
  id: OrderStatusFilter;
  label: string;
}

const TABS: Tab[] = [
  { id: 'all', label: '전체' },
  { id: 'shipping', label: '배송중' },
  { id: 'delivered', label: '배송완료' },
  { id: 'cancelled', label: '취소/반품' },
];

interface OrderStatusTabsProps {
  activeTab: OrderStatusFilter;
  onTabChange: (tab: OrderStatusFilter) => void;
}

export function OrderStatusTabs({ activeTab, onTabChange }: OrderStatusTabsProps) {
  return (
    <div className="order-status-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`order-status-tabs__tab ${activeTab === tab.id ? 'order-status-tabs__tab--active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
