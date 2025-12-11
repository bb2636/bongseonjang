import { Order } from '../../types/profile';
import OrderCard from './OrderCard';
import './RecentOrders.css';

interface RecentOrdersProps {
  orders: Order[];
  onOrderClick: (orderId: string) => void;
  onReturnClick: (orderId: string) => void;
  onReorderClick: (orderId: string) => void;
}

export default function RecentOrders({
  orders,
  onOrderClick,
  onReturnClick,
  onReorderClick,
}: RecentOrdersProps) {
  const orderCount = orders.length;

  return (
    <section className="recent-orders">
      <h3 className="recent-orders__title">
        진행 중 주문 현황 ({orderCount}개)
      </h3>
      
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
