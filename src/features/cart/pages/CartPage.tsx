import { useState } from 'react';
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

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    handleRemoveSelected();
    setIsDeleteModalOpen(false);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
  };

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
      onRemoveSelected={handleDeleteClick}
      onOrder={handleOrder}
      isDeleteModalOpen={isDeleteModalOpen}
      onConfirmDelete={handleConfirmDelete}
      onCancelDelete={handleCancelDelete}
    />
  );
}
