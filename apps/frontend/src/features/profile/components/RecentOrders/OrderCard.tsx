import { Order, OrderStatus } from '../../types/profile';
import './OrderCard.css';

interface OrderCardProps {
  order: Order;
  onOrderClick: (orderId: string) => void;
  onReturnClick: (orderId: string) => void;
  onReorderClick: (orderId: string) => void;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '주문접수',
  confirmed: '결제완료',
  shipping: '배송중',
  delivered: '배송완료',
  cancelled: '주문취소',
};

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원';
}

export default function OrderCard({
  order,
  onOrderClick,
  onReturnClick,
  onReorderClick,
}: OrderCardProps) {
  const statusLabel = STATUS_LABELS[order.status];
  const isDelivered = order.status === 'delivered';

  return (
    <article className="order-card">
      <button
        type="button"
        className="order-card__header"
        onClick={() => onOrderClick(order.id)}
      >
        <div className="order-card__info">
          <span className="order-card__date">{order.orderDate}</span>
          <span className="order-card__number">주문번호 {order.orderNumber}</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4L10 8L6 12" stroke="rgba(12, 12, 12, 0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="order-card__status">
        <span className={`order-card__status-label ${isDelivered ? 'order-card__status-label--delivered' : ''}`}>
          {statusLabel}
        </span>
        {order.statusDate && (
          <span className={`order-card__status-date ${isDelivered ? 'order-card__status-date--delivered' : ''}`}>
            {order.statusDate}
          </span>
        )}
      </div>

      <div className="order-card__items">
        {order.items.map((item) => (
          <div key={item.id} className="order-card__item">
            <div className="order-card__item-image">
              <img src={item.imageUrl} alt={item.productName} />
            </div>
            <div className="order-card__item-info">
              <div className="order-card__item-details">
                <span className="order-card__item-name">{item.productName}</span>
                <span className="order-card__item-quantity">수량 : {item.quantity}개</span>
              </div>
              <span className="order-card__item-price">{formatPrice(item.price)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="order-card__actions">
        <button
          type="button"
          className="order-card__action-button"
          onClick={() => onReturnClick(order.id)}
        >
          반품 접수
        </button>
        <button
          type="button"
          className="order-card__action-button"
          onClick={() => onReorderClick(order.id)}
        >
          재주문
        </button>
      </div>
    </article>
  );
}
