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
    handleQuantityChange,
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
      onQuantityChange={handleQuantityChange}
      onRemoveItem={handleRemoveItem}
      onRemoveSelected={handleRemoveSelected}
      onOrder={handleOrder}
    />
  );
}
