import { useParams } from 'react-router-dom';
import { useGuestOrderDetail } from '../hooks/useGuestOrderDetail';
import GuestOrderDetailView from '../views/GuestOrderDetailView';

export default function GuestOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { order, isLoading, isError, onBack } = useGuestOrderDetail(orderId || '');

  return (
    <GuestOrderDetailView
      order={order}
      isLoading={isLoading}
      isError={isError}
      onBack={onBack}
    />
  );
}
