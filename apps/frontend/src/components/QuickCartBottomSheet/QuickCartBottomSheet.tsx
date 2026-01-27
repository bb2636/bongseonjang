import { useState, useCallback, useEffect } from 'react';
import { useQuickCart, QuickCartOption } from '@/contexts/QuickCartContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { guestCartStorage } from '@/utils/guestStorage';
import { API_BASE_URL } from '@/shared/config/apiConfig';
import './QuickCartBottomSheet.css';

interface SelectedItem {
  id: string;
  option: QuickCartOption | null;
  quantity: number;
}

export default function QuickCartBottomSheet() {
  const { isOpen, product, isLoading, error, closeQuickCart } = useQuickCart();
  const { refreshCart } = useCart();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [noOptionQuantity, setNoOptionQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const productOptions = product?.options && product.options.length > 0 
    ? product.options 
    : product?.mainOptions || [];
  const hasOptions = productOptions.length > 0;
  const optionGroupName = (product?.mainOptions?.[0] as { groupName?: string })?.groupName || '옵션 선택';
  
  const isSoldOut = product ? (() => {
    const now = new Date();
    if (product.saleStartAt && new Date(product.saleStartAt) > now) {
      return true;
    }
    if (product.saleEndAt && new Date(product.saleEndAt) < now) {
      return true;
    }
    if (hasOptions) {
      return productOptions.every(opt => opt.stockQty === 0);
    }
    return product.stockQuantity === 0;
  })() : false;

  useEffect(() => {
    if (isOpen && product) {
      if (!hasOptions) {
        setSelectedItems([{
          id: `product-${product.id}`,
          option: null,
          quantity: 1,
        }]);
        setNoOptionQuantity(1);
      } else {
        setSelectedItems([]);
      }
      setIsDropdownOpen(false);
    }
  }, [isOpen, product, hasOptions]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOptionSelect = useCallback((option: QuickCartOption) => {
    const existingIndex = selectedItems.findIndex(
      (item) => item.option?.id === option.id
    );

    if (existingIndex >= 0) {
      const currentQty = selectedItems[existingIndex].quantity;
      if (currentQty >= option.stockQty) {
        return;
      }
      const newItems = [...selectedItems];
      newItems[existingIndex].quantity += 1;
      setSelectedItems(newItems);
    } else {
      const newItem: SelectedItem = {
        id: `${option.id}-${Date.now()}`,
        option,
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
            if (newQuantity <= 0) {
              return item;
            }
            if (item.option && newQuantity > item.option.stockQty) {
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const handleNoOptionQuantityChange = (delta: number) => {
    const newQuantity = noOptionQuantity + delta;
    if (newQuantity >= 1 && product) {
      setNoOptionQuantity(newQuantity);
      setSelectedItems([{
        id: `product-${product.id}`,
        option: null,
        quantity: newQuantity,
      }]);
    }
  };

  const calculateItemPrice = (item: SelectedItem): number => {
    if (!product) return 0;
    const usesMainOptions = !(product.options && product.options.length > 0);
    if (item.option) {
      const unitPrice = usesMainOptions 
        ? (item.option.additionalPrice || product.discountedPrice)
        : (product.basePrice + item.option.additionalPrice);
      return unitPrice * item.quantity;
    }
    return product.discountedPrice * item.quantity;
  };

  const formatPrice = (price: number): string => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const handleAddToCart = async () => {
    if (selectedItems.length === 0 || !product) return;

    setIsAdding(true);

    try {
      if (isAuthenticated) {
        const token = localStorage.getItem('user_token');
        const items = selectedItems.map(item => ({
          productOptionId: item.option?.id || null,
          quantity: item.quantity,
        }));

        const response = await fetch(`${API_BASE_URL}/cart/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product.id,
            items,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to add to cart');
        }
      } else {
        const usesMainOptions = !(product.options && product.options.length > 0);
        for (const item of selectedItems) {
          let unitPrice: number;
          if (item.option) {
            unitPrice = usesMainOptions 
              ? (item.option.additionalPrice || product.discountedPrice)
              : (product.basePrice + item.option.additionalPrice);
          } else {
            unitPrice = product.discountedPrice;
          }
          guestCartStorage.addItem({
            productId: product.id,
            productName: product.name,
            optionId: item.option?.id || null,
            optionName: item.option?.name || null,
            quantity: item.quantity,
            unitPrice,
            totalPrice: unitPrice * item.quantity,
            thumbnailUrl: product.imageUrl || '',
          });
        }
      }

      refreshCart();
      showToast('장바구니에 담았습니다', 'success');
      closeQuickCart();
    } catch (error) {
      console.error('Failed to add to cart:', error);
      const errorMessage = error instanceof Error ? error.message : '장바구니 담기에 실패했습니다';
      showToast(errorMessage, 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (selectedItems.length === 0 || !product) return;

    const usesMainOptions = !(product.options && product.options.length > 0);
    const items = selectedItems.map(item => {
      let unitPrice: number;
      if (item.option) {
        unitPrice = usesMainOptions 
          ? (item.option.additionalPrice || product.discountedPrice)
          : (product.basePrice + item.option.additionalPrice);
      } else {
        unitPrice = product.discountedPrice;
      }
      return {
        productOptionId: item.option?.id || null,
        optionName: item.option?.name || null,
        quantity: item.quantity,
        unitPrice,
      };
    });

    const directPurchaseData = {
      productId: product.id,
      productName: product.name,
      thumbnailUrl: product.imageUrl || '',
      items,
    };

    closeQuickCart();
    
    if (isAuthenticated) {
      navigate(`/checkout?direct=true&data=${encodeURIComponent(JSON.stringify(directPurchaseData))}`);
    } else {
      navigate(`/checkout/guest?direct=true&data=${encodeURIComponent(JSON.stringify(directPurchaseData))}`);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeQuickCart();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="quick-cart-overlay" onClick={handleOverlayClick}>
      <div className="quick-cart-sheet">
        <div className="quick-cart-sheet__drag-handle">
          <div className="quick-cart-sheet__drag-handle-bar" />
        </div>

        {isLoading ? (
          <div className="quick-cart-sheet__loading">
            <div className="quick-cart-sheet__spinner" />
          </div>
        ) : error ? (
          <div className="quick-cart-sheet__error">
            <p className="quick-cart-sheet__error-message">{error}</p>
            <button 
              className="quick-cart-sheet__error-close"
              onClick={closeQuickCart}
            >
              닫기
            </button>
          </div>
        ) : product ? (
          <>
            {hasOptions ? (
              <>
                <div className="quick-cart-sheet__options">
                  <div className="quick-cart-sheet__dropdown-wrapper">
                    <button
                      className="quick-cart-sheet__dropdown-trigger"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span>{optionGroupName}</span>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M5 7.5L10 12.5L15 7.5" stroke="rgba(12, 12, 12, 0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {isDropdownOpen && (
                      <div className="quick-cart-sheet__dropdown-menu">
                        {productOptions.map((option) => {
                          const usesMainOptions = !(product.options && product.options.length > 0);
                          const displayPrice = usesMainOptions
                            ? (option.additionalPrice || product.discountedPrice)
                            : option.additionalPrice;
                          const priceLabel = usesMainOptions
                            ? formatPrice(displayPrice)
                            : (displayPrice > 0 ? `+${formatPrice(displayPrice)}` : formatPrice(product.basePrice));
                          return (
                            <button
                              key={option.id}
                              className={`quick-cart-sheet__dropdown-item ${option.stockQty <= 0 ? 'quick-cart-sheet__dropdown-item--disabled' : ''}`}
                              onClick={() => option.stockQty > 0 && handleOptionSelect(option)}
                              disabled={option.stockQty <= 0}
                            >
                              <span>{option.name}</span>
                              <span className="quick-cart-sheet__dropdown-price">
                                {priceLabel}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {selectedItems.length > 0 && (
                  <div className="quick-cart-sheet__selected-items">
                    {selectedItems.map((item) => {
                      const itemPrice = calculateItemPrice(item);

                      return (
                        <div key={item.id} className="quick-cart-sheet__selected-item">
                          <div className="quick-cart-sheet__selected-header">
                            <span className="quick-cart-sheet__selected-name">{item.option?.name}</span>
                            <button className="quick-cart-sheet__remove-btn" onClick={() => removeItem(item.id)}>
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M15 5L5 15M5 5L15 15" stroke="rgba(12, 12, 12, 0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                          <div className="quick-cart-sheet__selected-footer">
                            <div className="quick-cart-sheet__price-info">
                              <span className="quick-cart-sheet__selected-price">{formatPrice(itemPrice)}</span>
                            </div>
                            <div className="quick-cart-sheet__quantity-controls">
                              <button
                                className="quick-cart-sheet__quantity-btn"
                                onClick={() => updateQuantity(item.id, -1)}
                                disabled={item.quantity <= 1}
                              >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                  <path d="M4.583 10H15.417" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
                                </svg>
                              </button>
                              <span className="quick-cart-sheet__quantity">{item.quantity}</span>
                              <button
                                className="quick-cart-sheet__quantity-btn"
                                onClick={() => updateQuantity(item.id, 1)}
                                disabled={item.option ? item.quantity >= item.option.stockQty : false}
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
              </>
            ) : (
              <div className="quick-cart-sheet__no-option">
                <div className="quick-cart-sheet__no-option-info">
                  <span className="quick-cart-sheet__no-option-name">{product.name}</span>
                  <div className="quick-cart-sheet__no-option-price-row">
                    <span className="quick-cart-sheet__no-option-price">
                      {formatPrice(product.discountedPrice * noOptionQuantity)}
                    </span>
                    {product.basePrice > product.discountedPrice && (
                      <span className="quick-cart-sheet__no-option-original">
                        {formatPrice(product.basePrice * noOptionQuantity)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="quick-cart-sheet__quantity-controls">
                  <button
                    className="quick-cart-sheet__quantity-btn"
                    onClick={() => handleNoOptionQuantityChange(-1)}
                    disabled={noOptionQuantity <= 1}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4.583 10H15.417" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
                    </svg>
                  </button>
                  <span className="quick-cart-sheet__quantity">{noOptionQuantity}</span>
                  <button
                    className="quick-cart-sheet__quantity-btn"
                    onClick={() => handleNoOptionQuantityChange(1)}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 4.583V15.417M4.583 10H15.417" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div className="quick-cart-sheet__button-wrapper">
              {isSoldOut ? (
                <button
                  className="quick-cart-sheet__buy-btn quick-cart-sheet__buy-btn--sold-out"
                  disabled
                >
                  품절
                </button>
              ) : (
                <>
                  <button
                    className="quick-cart-sheet__cart-btn"
                    onClick={handleAddToCart}
                    disabled={selectedItems.length === 0 || isAdding}
                  >
                    {isAdding ? '담는 중...' : '장바구니 담기'}
                  </button>
                  <button
                    className="quick-cart-sheet__buy-btn"
                    onClick={handleBuyNow}
                    disabled={selectedItems.length === 0 || isAdding}
                  >
                    구매하기
                  </button>
                </>
              )}
            </div>
          </>
        ) : null}

        <div className="quick-cart-sheet__home-indicator">
          <div className="quick-cart-sheet__home-indicator-bar" />
        </div>
      </div>
    </div>
  );
}
