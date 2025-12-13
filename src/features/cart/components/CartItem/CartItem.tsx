import type { CartItemDto } from '../../api/cartApi';
import './CartItem.css';

interface CartItemProps {
  item: CartItemDto;
  isSelected: boolean;
  onToggleSelect: (itemId: string) => void;
  onRemove: (itemId: string) => void;
}

export function CartItem({
  item,
  isSelected,
  onToggleSelect,
  onRemove,
}: CartItemProps) {
  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const getOptionText = () => {
    const parts: string[] = [];
    if (item.mainOptionName) {
      parts.push(item.mainOptionName);
    }
    if (item.subOptionName) {
      parts.push(item.subOptionName);
    }
    return parts.join(' / ');
  };

  return (
    <div className="cart-item">
      <div className="cart-item__main">
        <button
          className={`cart-item__checkbox ${isSelected ? 'cart-item__checkbox--checked' : ''}`}
          onClick={() => onToggleSelect(item.id)}
        >
          {isSelected && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect width="16" height="16" rx="2" fill="#3B9BD5"/>
              <path d="M4 8L7 11L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {!isSelected && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="0.5" y="0.5" width="15" height="15" rx="1.5" stroke="rgba(12, 12, 12, 0.5)"/>
            </svg>
          )}
        </button>
        <div className="cart-item__content">
          <div className="cart-item__info">
            <p className="cart-item__name">{item.productName}</p>
            {getOptionText() && (
              <p className="cart-item__option">{getOptionText()}</p>
            )}
          </div>
          <div className="cart-item__product-row">
            <div className="cart-item__image-wrapper">
              <img
                src={item.productImageUrl}
                alt={item.productName}
                className="cart-item__image"
              />
            </div>
            <div className="cart-item__price-info">
              <span className="cart-item__price">{formatPrice(item.unitPrice)}</span>
              {item.compareAtPrice && item.compareAtPrice > item.unitPrice && (
                <span className="cart-item__compare-price">{formatPrice(item.compareAtPrice)}</span>
              )}
            </div>
          </div>
        </div>
        <button
          className="cart-item__remove-button"
          onClick={() => onRemove(item.id)}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M7 7L15 15M15 7L7 15" stroke="rgba(12, 12, 12, 0.6)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      <div className="cart-item__shipping">
        <span>배송비 선불</span>
      </div>
    </div>
  );
}
