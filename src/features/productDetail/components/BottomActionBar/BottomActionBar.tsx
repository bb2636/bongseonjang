import { useState, useCallback } from 'react';
import type { MainOption, SubOption } from '../../types/productDetail';
import './BottomActionBar.css';

interface SelectedItem {
  id: string;
  mainOption: MainOption;
  subOption: SubOption | null;
  quantity: number;
}

interface BottomActionBarProps {
  mainOptions: MainOption[];
  subOptions: SubOption[];
  onAddToCart: (items: SelectedItem[]) => Promise<void>;
  onBuyNow: (items: SelectedItem[]) => Promise<void>;
}

export default function BottomActionBar({
  mainOptions,
  subOptions,
  onAddToCart,
  onBuyNow,
}: BottomActionBarProps) {
  const [selectedMainOption, setSelectedMainOption] = useState<MainOption | null>(null);
  const [selectedSubOption, setSelectedSubOption] = useState<SubOption | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isMainDropdownOpen, setIsMainDropdownOpen] = useState(false);
  const [isSubDropdownOpen, setIsSubDropdownOpen] = useState(false);

  const safeMainOptions = mainOptions || [];
  const safeSubOptions = subOptions || [];

  const hasSubOptions = safeSubOptions.length > 0;
  const mainOptionGroupName = safeMainOptions[0]?.groupName || '옵션 선택';
  const subOptionGroupName = safeSubOptions[0]?.groupName || '추가 선택';

  const handleMainOptionSelect = useCallback((option: MainOption) => {
    setSelectedMainOption(option);
    setSelectedSubOption(null);
    setIsMainDropdownOpen(false);

    if (!hasSubOptions) {
      const existingIndex = selectedItems.findIndex(
        (item) => item.mainOption.id === option.id && item.subOption === null
      );

      if (existingIndex >= 0) {
        const newItems = [...selectedItems];
        newItems[existingIndex].quantity += 1;
        setSelectedItems(newItems);
      } else {
        const newItem: SelectedItem = {
          id: `${option.id}-none-${Date.now()}`,
          mainOption: option,
          subOption: null,
          quantity: 1,
        };
        setSelectedItems([...selectedItems, newItem]);
      }
      setSelectedMainOption(null);
    }
  }, [hasSubOptions, selectedItems]);

  const handleSubOptionSelect = useCallback((option: SubOption) => {
    if (!selectedMainOption) return;

    const existingIndex = selectedItems.findIndex(
      (item) =>
        item.mainOption.id === selectedMainOption.id &&
        item.subOption?.id === option.id
    );

    if (existingIndex >= 0) {
      const newItems = [...selectedItems];
      newItems[existingIndex].quantity += 1;
      setSelectedItems(newItems);
    } else {
      const newItem: SelectedItem = {
        id: `${selectedMainOption.id}-${option.id}-${Date.now()}`,
        mainOption: selectedMainOption,
        subOption: option,
        quantity: 1,
      };
      setSelectedItems([...selectedItems, newItem]);
    }

    setSelectedMainOption(null);
    setSelectedSubOption(null);
    setIsSubDropdownOpen(false);
  }, [selectedMainOption, selectedItems]);

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
    const basePrice = item.mainOption.price;
    const additionalPrice = item.subOption?.additionalPrice || 0;
    return (basePrice + additionalPrice) * item.quantity;
  };

  const formatPrice = (price: number): string => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const handleAddToCart = async () => {
    if (selectedItems.length === 0) return;
    try {
      await onAddToCart(selectedItems);
      setSelectedItems([]);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleBuyNow = async () => {
    if (selectedItems.length === 0) return;
    try {
      await onBuyNow(selectedItems);
      setSelectedItems([]);
    } catch (error) {
      console.error('Failed to buy now:', error);
    }
  };

  return (
    <div className="bottom-action-bar">
      <div className="bottom-action-bar__options">
        <div className="bottom-action-bar__dropdown-wrapper">
          <button
            className="bottom-action-bar__dropdown-trigger"
            onClick={() => setIsMainDropdownOpen(!isMainDropdownOpen)}
          >
            <span>{selectedMainOption ? selectedMainOption.name : mainOptionGroupName}</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="rgba(12, 12, 12, 0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {isMainDropdownOpen && (
            <div className="bottom-action-bar__dropdown-menu">
              {safeMainOptions.map((option) => (
                <button
                  key={option.id}
                  className={`bottom-action-bar__dropdown-item ${option.stockQty <= 0 ? 'bottom-action-bar__dropdown-item--disabled' : ''}`}
                  onClick={() => option.stockQty > 0 && handleMainOptionSelect(option)}
                  disabled={option.stockQty <= 0}
                >
                  <span>{option.name}</span>
                  <span className="bottom-action-bar__dropdown-price">{formatPrice(option.price)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {hasSubOptions && selectedMainOption && (
          <div className="bottom-action-bar__dropdown-wrapper">
            <button
              className="bottom-action-bar__dropdown-trigger"
              onClick={() => setIsSubDropdownOpen(!isSubDropdownOpen)}
            >
              <span>{selectedSubOption ? selectedSubOption.name : subOptionGroupName}</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="rgba(12, 12, 12, 0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {isSubDropdownOpen && (
              <div className="bottom-action-bar__dropdown-menu">
                {safeSubOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`bottom-action-bar__dropdown-item ${option.stockQty <= 0 ? 'bottom-action-bar__dropdown-item--disabled' : ''}`}
                    onClick={() => option.stockQty > 0 && handleSubOptionSelect(option)}
                    disabled={option.stockQty <= 0}
                  >
                    <span>{option.name}</span>
                    <span className="bottom-action-bar__dropdown-price">
                      {option.additionalPrice > 0 ? `+${formatPrice(option.additionalPrice)}` : '추가금액 없음'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedItems.length > 0 && (
        <div className="bottom-action-bar__selected-items">
          {selectedItems.map((item) => {
            const itemPrice = calculateItemPrice(item);
            const originalPrice = item.mainOption.compareAtPrice
              ? (item.mainOption.compareAtPrice + (item.subOption?.additionalPrice || 0)) * item.quantity
              : null;
            const optionLabel = item.subOption
              ? `${item.mainOption.name} / ${item.subOption.name}`
              : item.mainOption.name;

            return (
              <div key={item.id} className="bottom-action-bar__selected-item">
                <div className="bottom-action-bar__selected-header">
                  <span className="bottom-action-bar__selected-name">{optionLabel}</span>
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
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                    <span className="bottom-action-bar__quantity">{item.quantity}</span>
                    <button
                      className="bottom-action-bar__quantity-btn"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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

export type { SelectedItem };
