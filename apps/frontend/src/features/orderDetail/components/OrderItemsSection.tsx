import { OrderDetailItem } from '../api/orderDetailApi';
import './OrderItemsSection.css';

interface OrderItemsSectionProps {
  statusLabel: string;
  items: OrderDetailItem[];
}

export function OrderItemsSection({ statusLabel, items }: OrderItemsSectionProps) {
  const formatPrice = (price: number) => {
    return price.toLocaleString() + '원';
  };

  const getOptionText = (mainOption: string | null, subOption: string | null) => {
    const parts = [mainOption, subOption].filter(Boolean);
    return parts.length > 0 ? parts.join(' / ') : null;
  };

  return (
    <section className="order-items-section">
      <h2 className="order-items-section__title">주문 상품</h2>
      <div className="order-items-section__status">
        <span className="order-items-section__status-label">{statusLabel}</span>
      </div>
      <div className="order-items-section__list">
        {items.map((item) => (
          <div key={item.id} className="order-items-section__item">
            <div className="order-items-section__item-image">
              <img src={item.productImageUrl} alt={item.productName} />
            </div>
            <div className="order-items-section__item-info">
              <span className="order-items-section__item-name">{item.productName}</span>
              {getOptionText(item.mainOptionName, item.subOptionName) && (
                <span className="order-items-section__item-option">
                  {getOptionText(item.mainOptionName, item.subOptionName)}
                </span>
              )}
              <span className="order-items-section__item-quantity">수량 : {item.quantity}개</span>
              <span className="order-items-section__item-price">{formatPrice(item.totalPrice)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
