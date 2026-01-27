import { useState, useEffect, useCallback } from 'react';
import type { MainOption, SubOption } from '../../types/productDetail';
import { useToast } from '../../../../contexts/ToastContext';
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
  basePrice: number;
  mainOptions: MainOption[];
  subOptions: SubOption[];
  onAddToCart: (items: SelectedItem[]) => void;
  onBuyNow: (items: SelectedItem[]) => void;
}

export default function OptionBottomSheet({
  isOpen,
  onClose,
  productName,
  basePrice,
  mainOptions,
  subOptions,
  onAddToCart,
  onBuyNow,
}: OptionBottomSheetProps) {
  const { showToast } = useToast();
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
    setSelectedMainOption(prev => prev?.id === option.id ? null : option);
    setSelectedSubOption(null);
  }, []);

  const handleSubOptionSelect = useCallback((option: SubOption) => {
    setSelectedSubOption(prev => prev?.id === option.id ? null : option);
  }, []);

  const canAddToList = selectedMainOption !== null;

  const getMaxStockForSelection = useCallback((mainOpt: MainOption, subOpt: SubOption | null): number => {
    const mainStock = mainOpt.stockQty;
    const subStock = subOpt?.stockQty;
    if (subStock !== undefined) {
      return Math.min(mainStock, subStock);
    }
    return mainStock;
  }, []);

  const addToSelectedItems = useCallback(() => {
    if (!selectedMainOption) return;

    const maxStock = getMaxStockForSelection(selectedMainOption, selectedSubOption);
    
    const existingIndex = selectedItems.findIndex(
      (item) =>
        item.mainOption.id === selectedMainOption.id &&
        item.subOption?.id === selectedSubOption?.id
    );

    if (existingIndex >= 0) {
      const currentQty = selectedItems[existingIndex].quantity;
      if (currentQty >= maxStock) {
        showToast(`재고가 ${maxStock}개 남았습니다.`, 'warning');
        setSelectedMainOption(null);
        setSelectedSubOption(null);
        return;
      }
      const newItems = [...selectedItems];
      newItems[existingIndex].quantity += 1;
      setSelectedItems(newItems);
    } else {
      if (maxStock <= 0) {
        showToast('품절된 옵션입니다.', 'error');
        setSelectedMainOption(null);
        setSelectedSubOption(null);
        return;
      }
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
  }, [selectedMainOption, selectedSubOption, selectedItems, getMaxStockForSelection, showToast]);

  const getItemMaxStock = useCallback((item: SelectedItem): number => {
    const mainStock = item.mainOption.stockQty;
    const subStock = item.subOption?.stockQty;
    if (subStock !== undefined) {
      return Math.min(mainStock, subStock);
    }
    return mainStock;
  }, []);

  const updateQuantity = useCallback((itemId: string, delta: number) => {
    setSelectedItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQuantity = item.quantity + delta;
            const maxStock = getItemMaxStock(item);
            
            if (delta > 0 && newQuantity > maxStock) {
              showToast(`재고가 ${maxStock}개 남았습니다.`, 'warning');
              return item;
            }
            
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  }, [getItemMaxStock, showToast]);

  const removeItem = useCallback((itemId: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const calculateItemPrice = (item: SelectedItem, productBasePrice: number): number => {
    const mainAdditionalPrice = item.mainOption.additionalPrice;
    const subAdditionalPrice = item.subOption?.additionalPrice || 0;
    return (productBasePrice + mainAdditionalPrice + subAdditionalPrice) * item.quantity;
  };

  const totalPrice = selectedItems.reduce((sum, item) => sum + calculateItemPrice(item, basePrice), 0);

  const formatPrice = (price: number): string => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const handleAddToCart = () => {
    if (selectedItems.length === 0) return;
    onAddToCart(selectedItems);
    setSelectedItems([]);
    onClose();
  };

  const handleBuyNow = () => {
    if (selectedItems.length === 0) return;
    onBuyNow(selectedItems);
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
            <h4 className="option-bottom-sheet__section-title">
              {mainOptionGroupName}
              <span className="option-bottom-sheet__required-badge">필수</span>
            </h4>
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
                  <span className="option-bottom-sheet__option-name">
                    {option.name}
                    {option.stockQty <= 0 && <span className="option-bottom-sheet__sold-out-badge">품절</span>}
                  </span>
                  <span className="option-bottom-sheet__option-price">
                    {option.additionalPrice > 0 ? `+${formatPrice(option.additionalPrice)}` : formatPrice(basePrice)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {hasSubOptions && (
            <>
              <div className="option-bottom-sheet__section-divider" />
              <div className="option-bottom-sheet__section">
                <h4 className="option-bottom-sheet__section-title">
                  {subOptionGroupName}
                  <span className="option-bottom-sheet__optional-badge">선택</span>
                </h4>
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
                      <span className="option-bottom-sheet__option-name">
                        {option.name}
                        {option.stockQty <= 0 && <span className="option-bottom-sheet__sold-out-badge">품절</span>}
                      </span>
                      <span className="option-bottom-sheet__option-additional">
                        {option.additionalPrice > 0 ? `+${formatPrice(option.additionalPrice)}` : '추가금액 없음'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {canAddToList && (
            <button className="option-bottom-sheet__add-btn" onClick={addToSelectedItems}>
              선택한 옵션 추가하기
            </button>
          )}

          {selectedItems.length > 0 && (
            <div className="option-bottom-sheet__selected-items">
              {selectedItems.map((item) => {
                const itemPrice = calculateItemPrice(item, basePrice);
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
                          disabled={item.quantity >= getItemMaxStock(item)}
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
          <div className="option-bottom-sheet__buttons">
            <button
              className="option-bottom-sheet__cart-btn"
              onClick={handleAddToCart}
              disabled={selectedItems.length === 0}
            >
              장바구니에 담기
            </button>
            <button
              className="option-bottom-sheet__buy-btn"
              onClick={handleBuyNow}
              disabled={selectedItems.length === 0}
            >
              구매하기
            </button>
          </div>
        </div>

        <div className="option-bottom-sheet__home-indicator">
          <div className="option-bottom-sheet__home-indicator-bar" />
        </div>
      </div>
    </>
  );
}

export type { SelectedItem };
