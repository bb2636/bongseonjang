import './OrderInfoCard.css';

interface OrderInfoCardProps {
  orderDate: string;
  orderNumber: string;
}

export function OrderInfoCard({ orderDate, orderNumber }: OrderInfoCardProps) {
  return (
    <div className="order-info-card">
      <span className="order-info-card__date">{orderDate}</span>
      <span className="order-info-card__number">{orderNumber}</span>
    </div>
  );
}
