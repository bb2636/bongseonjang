import { useParams } from 'react-router-dom';
import { useOrderDetail } from '../hooks/useOrderDetail';
import { OrderDetailView } from '../views/OrderDetailView';

export function PaymentCompletePage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { order, isLoading, isError, onBack, onCartClick } = useOrderDetail(orderId || '');

  return (
    <OrderDetailView
      title="결제 완료"
      order={order}
      isLoading={isLoading}
      isError={isError}
      onBack={onBack}
      onCartClick={onCartClick}
    />
  );
}
