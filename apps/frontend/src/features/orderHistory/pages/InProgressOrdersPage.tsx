import { useInProgressOrders } from '../hooks/useInProgressOrders';
import { InProgressOrdersView } from '../views/InProgressOrdersView';

export function InProgressOrdersPage() {
  const {
    orders,
    isLoading,
    handleBack,
    handleOrderClick,
    handleCartClick,
  } = useInProgressOrders();

  return (
    <InProgressOrdersView
      orders={orders}
      isLoading={isLoading}
      onBack={handleBack}
      onOrderClick={handleOrderClick}
      onCartClick={handleCartClick}
    />
  );
}
