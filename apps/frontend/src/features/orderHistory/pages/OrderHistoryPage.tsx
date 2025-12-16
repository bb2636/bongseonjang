import { useOrderHistory } from '../hooks/useOrderHistory';
import { OrderHistoryView } from '../views/OrderHistoryView';

export function OrderHistoryPage() {
  const {
    activeTab,
    orders,
    isLoading,
    handleBack,
    handleTabChange,
    handleOrderClick,
    handleCartClick,
  } = useOrderHistory();

  return (
    <OrderHistoryView
      activeTab={activeTab}
      orders={orders}
      isLoading={isLoading}
      onBack={handleBack}
      onTabChange={handleTabChange}
      onOrderClick={handleOrderClick}
      onCartClick={handleCartClick}
    />
  );
}
