import { useState } from 'react';
import type { ProductOption } from '../../types/productDetail';
import './ProductOptions.css';

interface ProductOptionsProps {
  options: ProductOption[];
  selectedOption: ProductOption | null;
  quantity: number;
  onOptionSelect: (option: ProductOption) => void;
  onQuantityChange: (quantity: number) => void;
}

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

export default function ProductOptions({
  options,
  selectedOption,
  quantity,
  onOptionSelect,
  onQuantityChange,
}: ProductOptionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    onQuantityChange(quantity + 1);
  };

  const hasOptions = options.length > 0;

  return (
    <div className="product-options">
      {hasOptions && (
        <div className="product-options__section">
          <button 
            className="product-options__toggle"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="product-options__label">옵션 선택</span>
            <span className="product-options__selected">
              {selectedOption ? selectedOption.name : '옵션을 선택해주세요'}
            </span>
            <svg 
              className={`product-options__arrow ${isExpanded ? 'product-options__arrow--expanded' : ''}`}
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none"
            >
              <path d="M4 6L8 10L12 6" stroke="rgba(12, 12, 12, 0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {isExpanded && (
            <div className="product-options__list">
              {options.map((option) => (
                <button
                  key={option.id}
                  className={`product-options__item ${selectedOption?.id === option.id ? 'product-options__item--selected' : ''}`}
                  onClick={() => {
                    onOptionSelect(option);
                    setIsExpanded(false);
                  }}
                  disabled={option.stockQty === 0}
                >
                  <span className="product-options__item-name">{option.name}</span>
                  <span className="product-options__item-price">
                    {formatPrice(option.price)}원
                    {option.stockQty === 0 && <span className="product-options__soldout">(품절)</span>}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="product-options__quantity">
        <span className="product-options__quantity-label">수량</span>
        <div className="product-options__quantity-controls">
          <button 
            className="product-options__quantity-btn"
            onClick={handleDecrease}
            disabled={quantity <= 1}
          >
            −
          </button>
          <span className="product-options__quantity-value">{quantity}</span>
          <button 
            className="product-options__quantity-btn"
            onClick={handleIncrease}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
