import { useParams } from 'react-router-dom';
import { useOrderDetail } from '../hooks/useOrderDetail';
import { OrderDetailView } from '../views/OrderDetailView';

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { order, isLoading, isError, onBack, onCartClick } = useOrderDetail(orderId || '');

  return (
    <OrderDetailView
      title="주문내역 상세"
      order={order}
      isLoading={isLoading}
      isError={isError}
      onBack={onBack}
      onCartClick={onCartClick}
    />
  );
}
