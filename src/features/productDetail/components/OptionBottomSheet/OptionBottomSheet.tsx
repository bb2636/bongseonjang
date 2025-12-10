import { useState, useEffect, useCallback } from 'react';
import type { MainOption, SubOption } from '../../types/productDetail';
import './OptionBottomSheet.css';

interface SelectedItem {
  id: string;
  mainOption: MainOption;
  subOption: SubOption | null;
  quantity: number;
}

interface OptionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  mainOptions: MainOption[];
  subOptions: SubOption[];
  onConfirm: (items: SelectedItem[]) => void;
}

export default function OptionBottomSheet({
  isOpen,
  onClose,
  productName,
  mainOptions,
  subOptions,
  onConfirm,
}: OptionBottomSheetProps) {
  const [selectedMainOption, setSelectedMainOption] = useState<MainOption | null>(null);
  const [selectedSubOption, setSelectedSubOption] = useState<SubOption | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const hasSubOptions = subOptions.length > 0;

  useEffect(() => {
    if (!isOpen) {
      setSelectedMainOption(null);
      setSelectedSubOption(null);
      setSelectedItems([]);
    }
  }, [isOpen]);

  const handleMainOptionSelect = useCallback((option: MainOption) => {
    setSelectedMainOption(option);
    setSelectedSubOption(null);
  }, []);

  const handleSubOptionSelect = useCallback((option: SubOption) => {
    setSelectedSubOption(option);
  }, []);

  const canAddToList = selectedMainOption && (!hasSubOptions || selectedSubOption);

  const addToSelectedItems = useCallback(() => {
    if (!selectedMainOption) return;
    if (hasSubOptions && !selectedSubOption) return;

    const existingIndex = selectedItems.findIndex(
      (item) =>
        item.mainOption.id === selectedMainOption.id &&
        (hasSubOptions ? item.subOption?.id === selectedSubOption?.id : true)
    );

    if (existingIndex >= 0) {
      const newItems = [...selectedItems];
      newItems[existingIndex].quantity += 1;
      setSelectedItems(newItems);
    } else {
      const newItem: SelectedItem = {
        id: `${selectedMainOption.id}-${selectedSubOption?.id || 'none'}-${Date.now()}`,
        mainOption: selectedMainOption,
        subOption: selectedSubOption,
        quantity: 1,
      };
      setSelectedItems([...selectedItems, newItem]);
    }

    setSelectedMainOption(null);
    setSelectedSubOption(null);
  }, [selectedMainOption, selectedSubOption, selectedItems, hasSubOptions]);

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

  const totalPrice = selectedItems.reduce((sum, item) => sum + calculateItemPrice(item), 0);

  const formatPrice = (price: number): string => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const handleConfirm = () => {
    if (selectedItems.length === 0) return;
    onConfirm(selectedItems);
    setSelectedItems([]);
    onClose();
  };

  const mainOptionGroupName = mainOptions[0]?.groupName || '옵션 선택';
  const subOptionGroupName = subOptions[0]?.groupName || '추가 선택';

  return (
    <>
      <div
        className={`option-bottom-sheet__overlay ${isOpen ? 'option-bottom-sheet__overlay--visible' : ''}`}
        onClick={onClose}
      />
      <div className={`option-bottom-sheet ${isOpen ? 'option-bottom-sheet--visible' : ''}`}>
        <div className="option-bottom-sheet__handle">
          <div className="option-bottom-sheet__handle-bar" />
        </div>

        <div className="option-bottom-sheet__header">
          <h3 className="option-bottom-sheet__title">{productName}</h3>
          <button className="option-bottom-sheet__close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="rgba(12, 12, 12, 0.9)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="option-bottom-sheet__content">
          <div className="option-bottom-sheet__section">
            <h4 className="option-bottom-sheet__section-title">{mainOptionGroupName}</h4>
            <div className="option-bottom-sheet__options">
              {mainOptions.map((option) => (
                <button
                  key={option.id}
                  className={`option-bottom-sheet__option ${
                    selectedMainOption?.id === option.id ? 'option-bottom-sheet__option--selected' : ''
                  } ${option.stockQty <= 0 ? 'option-bottom-sheet__option--disabled' : ''}`}
                  onClick={() => option.stockQty > 0 && handleMainOptionSelect(option)}
                  disabled={option.stockQty <= 0}
                >
                  <span className="option-bottom-sheet__option-name">{option.name}</span>
                  <span className="option-bottom-sheet__option-price">{formatPrice(option.price)}</span>
                </button>
              ))}
            </div>
          </div>

          {hasSubOptions && selectedMainOption && (
            <div className="option-bottom-sheet__section">
              <h4 className="option-bottom-sheet__section-title">{subOptionGroupName}</h4>
              <div className="option-bottom-sheet__options">
                {subOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`option-bottom-sheet__option ${
                      selectedSubOption?.id === option.id ? 'option-bottom-sheet__option--selected' : ''
                    } ${option.stockQty <= 0 ? 'option-bottom-sheet__option--disabled' : ''}`}
                    onClick={() => option.stockQty > 0 && handleSubOptionSelect(option)}
                    disabled={option.stockQty <= 0}
                  >
                    <span className="option-bottom-sheet__option-name">{option.name}</span>
                    <span className="option-bottom-sheet__option-additional">
                      {option.additionalPrice > 0 ? `+${formatPrice(option.additionalPrice)}` : '추가금액 없음'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {canAddToList && (
            <button className="option-bottom-sheet__add-btn" onClick={addToSelectedItems}>
              선택한 옵션 추가하기
            </button>
          )}

          {selectedItems.length > 0 && (
            <div className="option-bottom-sheet__selected-items">
              {selectedItems.map((item) => {
                const itemPrice = calculateItemPrice(item);
                const originalPrice = item.mainOption.compareAtPrice 
                  ? (item.mainOption.compareAtPrice + (item.subOption?.additionalPrice || 0)) * item.quantity 
                  : null;
                const optionLabel = item.subOption 
                  ? `${item.mainOption.name} / ${item.subOption.name}`
                  : item.mainOption.name;

                return (
                  <div key={item.id} className="option-bottom-sheet__selected-item">
                    <div className="option-bottom-sheet__selected-header">
                      <div className="option-bottom-sheet__selected-info">
                        <span className="option-bottom-sheet__selected-name">{optionLabel}</span>
                      </div>
                      <button className="option-bottom-sheet__remove-btn" onClick={() => removeItem(item.id)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M18 6L6 18M6 6L18 18"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="option-bottom-sheet__selected-footer">
                      <div className="option-bottom-sheet__price-info">
                        <span className="option-bottom-sheet__selected-price">{formatPrice(itemPrice)}</span>
                        {originalPrice && originalPrice > itemPrice && (
                          <span className="option-bottom-sheet__original-price">{formatPrice(originalPrice)}</span>
                        )}
                      </div>
                      <div className="option-bottom-sheet__quantity-controls">
                        <button
                          className="option-bottom-sheet__quantity-btn"
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M4 10H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                        <span className="option-bottom-sheet__quantity">{item.quantity}</span>
                        <button
                          className="option-bottom-sheet__quantity-btn"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="option-bottom-sheet__footer">
          <button
            className="option-bottom-sheet__submit"
            onClick={handleConfirm}
            disabled={selectedItems.length === 0}
          >
            {selectedItems.length > 0
              ? `${formatPrice(totalPrice)} 구매하기`
              : '옵션을 선택해주세요'}
          </button>
        </div>

        <div className="option-bottom-sheet__home-indicator">
          <div className="option-bottom-sheet__home-indicator-bar" />
        </div>
      </div>
    </>
  );
}

export type { SelectedItem };
