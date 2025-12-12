import { Order } from '../../types/profile';
import OrderCard from './OrderCard';
import './RecentOrders.css';

interface RecentOrdersProps {
  orders: Order[];
  onOrderClick: (orderId: string) => void;
  onReturnClick: (orderId: string) => void;
  onReorderClick: (orderId: string) => void;
  onViewAllClick: () => void;
}

export default function RecentOrders({
  orders,
  onOrderClick,
  onReturnClick,
  onReorderClick,
  onViewAllClick,
}: RecentOrdersProps) {
  const orderCount = orders.length;

  return (
    <section className="recent-orders">
      <div className="recent-orders__header">
        <h3 className="recent-orders__title">
          진행 중 주문 현황 ({orderCount}개)
        </h3>
        <button className="recent-orders__view-all" onClick={onViewAllClick}>
          전체보기
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3L9 7L5 11" stroke="rgba(12, 12, 12, 0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div className="recent-orders__list">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onOrderClick={onOrderClick}
            onReturnClick={onReturnClick}
            onReorderClick={onReorderClick}
          />
        ))}
      </div>
    </section>
  );
}
