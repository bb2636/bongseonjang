import { OrderHistoryEntry } from '../api/orderHistoryApi';
import './OrderCard.css';

interface OrderCardProps {
  order: OrderHistoryEntry;
  onOrderClick: (orderId: string) => void;
}

export function OrderCard({ order, onOrderClick }: OrderCardProps) {
  const formatPrice = (price: number) => {
    return price.toLocaleString() + '원';
  };

  const getOptionText = (mainOption: string | null, subOption: string | null) => {
    const parts = [mainOption, subOption].filter(Boolean);
    return parts.length > 0 ? parts.join(' / ') : null;
  };

  return (
    <div className="order-card">
      <div className="order-card__header" onClick={() => onOrderClick(order.id)}>
        <div className="order-card__header-info">
          <span className="order-card__date">{order.orderDate}</span>
          <span className="order-card__number">주문번호 {order.orderNumber}</span>
        </div>
        <svg className="order-card__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4L10 8L6 12" stroke="rgba(12, 12, 12, 0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div className="order-card__status">
        <span className="order-card__status-label">{order.statusLabel}</span>
        <span className="order-card__status-date">{order.statusDate}</span>
      </div>

      {order.shipment && (
        <div className="order-card__shipment">
          <div className="order-card__shipment-row">
            <span className="order-card__shipment-label">택배사</span>
            <span className="order-card__shipment-value">{order.shipment.carrier}</span>
          </div>
          <div className="order-card__shipment-row">
            <span className="order-card__shipment-label">운송장</span>
            <span className="order-card__shipment-value">{order.shipment.trackingNumber}</span>
          </div>
        </div>
      )}

      <div className="order-card__items">
        {order.items.map((item) => (
          <div key={item.id} className="order-card__item">
            <div className="order-card__item-image">
              <img src={item.productImageUrl} alt={item.productName} />
            </div>
            <div className="order-card__item-info">
              <div className="order-card__item-details">
                <span className="order-card__item-name">{item.productName}</span>
                {getOptionText(item.mainOptionName, item.subOptionName) && (
                  <span className="order-card__item-option">
                    {getOptionText(item.mainOptionName, item.subOptionName)}
                  </span>
                )}
                <span className="order-card__item-quantity">수량 : {item.quantity}개</span>
              </div>
              <span className="order-card__item-price">{formatPrice(item.totalPrice)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
