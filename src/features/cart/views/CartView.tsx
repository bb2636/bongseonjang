import type { CartDto, CartItemDto } from '../api/cartApi';
import { CartAppBar } from '../components/CartAppBar';
import { CartItem } from '../components/CartItem';
import { CartSummary } from '../components/CartSummary';
import './CartView.css';

interface CartViewProps {
  cart: CartDto | undefined;
  isLoading: boolean;
  selectedItems: Set<string>;
  isAllSelected: boolean;
  selectedSummary: {
    subtotal: number;
    itemCount: number;
  };
  onToggleSelectItem: (itemId: string) => void;
  onToggleSelectAll: () => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onRemoveSelected: () => void;
  onOrder: () => void;
}

export function CartView({
  cart,
  isLoading,
  selectedItems,
  isAllSelected,
  selectedSummary,
  onToggleSelectItem,
  onToggleSelectAll,
  onQuantityChange,
  onRemoveItem,
  onRemoveSelected,
  onOrder,
}: CartViewProps) {
  if (isLoading) {
    return (
      <div className="cart-view">
        <CartAppBar />
        <div className="cart-view__loading">
          <p>장바구니를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];

  return (
    <div className="cart-view">
      <CartAppBar />
      <div className="cart-view__header">
        <div className="cart-view__select-all">
          <button
            className={`cart-view__checkbox ${isAllSelected ? 'cart-view__checkbox--checked' : ''}`}
            onClick={onToggleSelectAll}
          >
            {isAllSelected ? (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect width="22" height="22" rx="2" fill="#3B9BD5"/>
                <path d="M6 11L9.5 14.5L16 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="0.5" y="0.5" width="21" height="21" rx="1.5" stroke="rgba(12, 12, 12, 0.5)"/>
              </svg>
            )}
          </button>
          <span className="cart-view__select-label">전체</span>
        </div>
        <button
          className="cart-view__delete-button"
          onClick={onRemoveSelected}
          disabled={selectedItems.size === 0}
        >
          선택삭제
        </button>
      </div>
      <div className="cart-view__items">
        {items.length === 0 ? (
          <div className="cart-view__empty">
            <p>장바구니가 비어있습니다.</p>
          </div>
        ) : (
          items.map(item => (
            <CartItem
              key={item.id}
              item={item}
              isSelected={selectedItems.has(item.id)}
              onToggleSelect={onToggleSelectItem}
              onQuantityChange={onQuantityChange}
              onRemove={onRemoveItem}
            />
          ))
        )}
      </div>
      <CartSummary
        subtotal={selectedSummary.subtotal}
        itemCount={selectedSummary.itemCount}
        onOrder={onOrder}
      />
    </div>
  );
}
