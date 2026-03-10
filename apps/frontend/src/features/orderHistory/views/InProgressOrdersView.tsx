import { OrderHistoryEntry } from '../api/orderHistoryApi';
import { OrderCard } from '../components/OrderCard';
import { AppBar, AppBarSpacer } from '../../../components/AppBar';
import './OrderHistoryView.css';

interface InProgressOrdersViewProps {
  orders: OrderHistoryEntry[];
  isLoading: boolean;
  onBack: () => void;
  onOrderClick: (orderId: string) => void;
  onCartClick: () => void;
}

export function InProgressOrdersView({
  orders,
  isLoading,
  onBack,
  onOrderClick,
  onCartClick,
}: InProgressOrdersViewProps) {
  return (
    <div className="order-history">
      <AppBar variant="subpage" title="진행 중 주문" onBackClick={onBack} onCartClick={onCartClick} />
      <AppBarSpacer variant="subpage" />

      <div className="order-history__content">
        {isLoading ? (
          <div className="order-history__loading">
            <div className="order-history__skeleton">
              {[1, 2, 3].map((i) => (
                <div key={i} className="order-history__skeleton-card">
                  <div className="order-history__skeleton-header"></div>
                  <div className="order-history__skeleton-status"></div>
                  <div className="order-history__skeleton-item"></div>
                </div>
              ))}
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="order-history__empty">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M16 42C17.1046 42 18 41.1046 18 40C18 38.8954 17.1046 38 16 38C14.8954 38 14 38.8954 14 40C14 41.1046 14.8954 42 16 42Z" stroke="rgba(12, 12, 12, 0.3)" strokeWidth="2"/>
              <path d="M36 42C37.1046 42 38 41.1046 38 40C38 38.8954 37.1046 38 36 38C34.8954 38 34 38.8954 34 40C34 41.1046 34.8954 42 36 42Z" stroke="rgba(12, 12, 12, 0.3)" strokeWidth="2"/>
              <path d="M4 6H10L14.68 28.39C14.7714 28.8504 15.0219 29.2639 15.3875 29.5583C15.7532 29.8526 16.2107 30.0084 16.68 30H35.4C35.8693 30.0084 36.3268 29.8526 36.6925 29.5583C37.0581 29.2639 37.3086 28.8504 37.4 28.39L40 14H12" stroke="rgba(12, 12, 12, 0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="order-history__empty-text">진행 중인 주문이 없습니다</p>
          </div>
        ) : (
          <div className="order-history__list">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onOrderClick={onOrderClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
