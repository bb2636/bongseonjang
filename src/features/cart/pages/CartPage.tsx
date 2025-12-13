import { useCart } from '../hooks/useCart';
import { CartView } from '../views/CartView';

export function CartPage() {
  const {
    cart,
    isLoading,
    selectedItems,
    isAllSelected,
    selectedSummary,
    toggleSelectItem,
    toggleSelectAll,
    handleRemoveItem,
    handleRemoveSelected,
    handleOrder,
  } = useCart();

  return (
    <CartView
      cart={cart}
      isLoading={isLoading}
      selectedItems={selectedItems}
      isAllSelected={isAllSelected}
      selectedSummary={selectedSummary}
      onToggleSelectItem={toggleSelectItem}
      onToggleSelectAll={toggleSelectAll}
      onRemoveItem={handleRemoveItem}
      onRemoveSelected={handleRemoveSelected}
      onOrder={handleOrder}
    />
  );
}
