import { useState, useCallback } from 'react';
import type { MainOption } from '../../types/productDetail';
import './BottomActionBar.css';

interface ProductInfo {
  id: string;
  name: string;
  basePrice: number;
  discountedPrice: number;
}

interface SelectedItem {
  id: string;
  mainOption: MainOption | null;
  productInfo: ProductInfo | null;
  quantity: number;
}

interface BottomActionBarProps {
  product: ProductInfo;
  mainOptions: MainOption[];
  onAddToCart: (items: SelectedItem[]) => Promise<void>;
  onBuyNow: (items: SelectedItem[]) => Promise<void>;
}

export default function BottomActionBar({
  product,
  mainOptions,
  onAddToCart,
  onBuyNow,
}: BottomActionBarProps) {
  const safeMainOptions = mainOptions || [];
  const hasOptions = safeMainOptions.length > 0;

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>(() => {
    if (!hasOptions) {
      return [{
        id: `product-${product.id}`,
        mainOption: null,
        productInfo: product,
        quantity: 1,
      }];
    }
    return [];
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [noOptionQuantity, setNoOptionQuantity] = useState(1);

  const optionGroupName = safeMainOptions[0]?.groupName || '옵션 선택';

  const handleOptionSelect = useCallback((option: MainOption) => {
    const existingIndex = selectedItems.findIndex(
      (item) => item.mainOption?.id === option.id
    );

    if (existingIndex >= 0) {
      const newItems = [...selectedItems];
      newItems[existingIndex].quantity += 1;
      setSelectedItems(newItems);
    } else {
      const newItem: SelectedItem = {
        id: `${option.id}-${Date.now()}`,
        mainOption: option,
        productInfo: null,
        quantity: 1,
      };
      setSelectedItems([...selectedItems, newItem]);
    }
    setIsDropdownOpen(false);
  }, [selectedItems]);

  const updateQuantity = useCallback((itemId: string, delta: number) => {
    setSelectedItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQuantity = item.quantity + delta;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const calculateItemPrice = (item: SelectedItem): number => {
    if (item.mainOption) {
      return item.mainOption.price * item.quantity;
    }
    if (item.productInfo) {
      return item.productInfo.discountedPrice * item.quantity;
    }
    return 0;
  };

  const getItemName = (item: SelectedItem): string => {
    if (item.mainOption) {
      return item.mainOption.name;
    }
    if (item.productInfo) {
      return item.productInfo.name;
    }
    return '';
  };

  const getOriginalPrice = (item: SelectedItem): number | null => {
    if (item.mainOption?.compareAtPrice) {
      return item.mainOption.compareAtPrice * item.quantity;
    }
    if (item.productInfo && item.productInfo.basePrice > item.productInfo.discountedPrice) {
      return item.productInfo.basePrice * item.quantity;
    }
    return null;
  };

  const formatPrice = (price: number): string => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const handleNoOptionQuantityChange = (delta: number) => {
    const newQuantity = noOptionQuantity + delta;
    if (newQuantity >= 1) {
      setNoOptionQuantity(newQuantity);
      setSelectedItems([{
        id: `product-${product.id}`,
        mainOption: null,
        productInfo: product,
        quantity: newQuantity,
      }]);
    }
  };

  const handleAddToCart = async () => {
    if (selectedItems.length === 0) return;
    try {
      await onAddToCart(selectedItems);
      if (hasOptions) {
        setSelectedItems([]);
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleBuyNow = async () => {
    if (selectedItems.length === 0) return;
    try {
      await onBuyNow(selectedItems);
      if (hasOptions) {
        setSelectedItems([]);
      }
    } catch (error) {
      console.error('Failed to buy now:', error);
    }
  };

  if (!hasOptions) {
    return (
      <div className="bottom-action-bar">
        <div className="bottom-action-bar__drag-handle">
          <div className="bottom-action-bar__drag-handle-bar" />
        </div>

        <div className="bottom-action-bar__no-option">
          <div className="bottom-action-bar__no-option-info">
            <span className="bottom-action-bar__no-option-name">{product.name}</span>
            <div className="bottom-action-bar__no-option-price-row">
              <span className="bottom-action-bar__no-option-price">
                {formatPrice(product.discountedPrice * noOptionQuantity)}
              </span>
              {product.basePrice > product.discountedPrice && (
                <span className="bottom-action-bar__no-option-original">
                  {formatPrice(product.basePrice * noOptionQuantity)}
                </span>
              )}
            </div>
          </div>
          <div className="bottom-action-bar__quantity-controls">
            <button
              className="bottom-action-bar__quantity-btn"
              onClick={() => handleNoOptionQuantityChange(-1)}
              disabled={noOptionQuantity <= 1}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4.583 10H15.417" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
              </svg>
            </button>
            <span className="bottom-action-bar__quantity">{noOptionQuantity}</span>
            <button
              className="bottom-action-bar__quantity-btn"
              onClick={() => handleNoOptionQuantityChange(1)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4.583V15.417M4.583 10H15.417" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="bottom-action-bar__buttons">
          <button
            className="bottom-action-bar__cart-btn"
            onClick={handleAddToCart}
          >
            장바구니에 담기
          </button>
          <button
            className="bottom-action-bar__buy-btn"
            onClick={handleBuyNow}
          >
            구매하기
          </button>
        </div>

        <div className="bottom-action-bar__home-indicator">
          <div className="bottom-action-bar__home-indicator-bar" />
        </div>
      </div>
    );
  }

  return (
    <div className="bottom-action-bar">
      <div className="bottom-action-bar__drag-handle">
        <div className="bottom-action-bar__drag-handle-bar" />
      </div>

      <div className="bottom-action-bar__options">
        <div className="bottom-action-bar__dropdown-wrapper">
          <button
            className="bottom-action-bar__dropdown-trigger"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>{optionGroupName}</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="rgba(12, 12, 12, 0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {isDropdownOpen && (
            <div className="bottom-action-bar__dropdown-menu">
              {safeMainOptions.map((option) => (
                <button
                  key={option.id}
                  className={`bottom-action-bar__dropdown-item ${option.stockQty <= 0 ? 'bottom-action-bar__dropdown-item--disabled' : ''}`}
                  onClick={() => option.stockQty > 0 && handleOptionSelect(option)}
                  disabled={option.stockQty <= 0}
                >
                  <span>{option.name}</span>
                  <span className="bottom-action-bar__dropdown-price">{formatPrice(option.price)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedItems.length > 0 && (
        <div className="bottom-action-bar__selected-items">
          {selectedItems.map((item) => {
            const itemPrice = calculateItemPrice(item);
            const originalPrice = getOriginalPrice(item);

            return (
              <div key={item.id} className="bottom-action-bar__selected-item">
                <div className="bottom-action-bar__selected-header">
                  <span className="bottom-action-bar__selected-name">{getItemName(item)}</span>
                  <button className="bottom-action-bar__remove-btn" onClick={() => removeItem(item.id)}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M15 5L5 15M5 5L15 15" stroke="rgba(12, 12, 12, 0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                <div className="bottom-action-bar__selected-footer">
                  <div className="bottom-action-bar__price-info">
                    <span className="bottom-action-bar__selected-price">{formatPrice(itemPrice)}</span>
                    {originalPrice && originalPrice > itemPrice && (
                      <span className="bottom-action-bar__original-price">{formatPrice(originalPrice)}</span>
                    )}
                  </div>
                  <div className="bottom-action-bar__quantity-controls">
                    <button
                      className="bottom-action-bar__quantity-btn"
                      onClick={() => updateQuantity(item.id, -1)}
                      disabled={item.quantity <= 1}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M4.583 10H15.417" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
                      </svg>
                    </button>
                    <span className="bottom-action-bar__quantity">{item.quantity}</span>
                    <button
                      className="bottom-action-bar__quantity-btn"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 4.583V15.417M4.583 10H15.417" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bottom-action-bar__buttons">
        <button
          className="bottom-action-bar__cart-btn"
          onClick={handleAddToCart}
          disabled={selectedItems.length === 0}
        >
          장바구니에 담기
        </button>
        <button
          className="bottom-action-bar__buy-btn"
          onClick={handleBuyNow}
          disabled={selectedItems.length === 0}
        >
          구매하기
        </button>
      </div>

      <div className="bottom-action-bar__home-indicator">
        <div className="bottom-action-bar__home-indicator-bar" />
      </div>
    </div>
  );
}

export type { SelectedItem, ProductInfo };
