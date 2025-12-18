import { useParams, useNavigate } from 'react-router-dom';
import { useOrderDetail } from '../hooks/useOrderDetail';
import { OrderDetailView } from '../views/OrderDetailView';

export function PaymentCompletePage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { order, isLoading, isError, onCartClick } = useOrderDetail(orderId || '');

  const handleBack = () => {
    navigate('/', { replace: true });
  };

  return (
    <OrderDetailView
      title="결제 완료"
      order={order}
      isLoading={isLoading}
      isError={isError}
      onBack={handleBack}
      onCartClick={onCartClick}
    />
  );
}
