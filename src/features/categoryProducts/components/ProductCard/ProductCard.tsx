import './ProductCard.css';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  discountRate: number;
  imageUrl: string;
  onClick: () => void;
  onAddToCart: () => void;
}

export default function ProductCard({
  name,
  price,
  discountRate,
  imageUrl,
  onClick,
  onAddToCart,
}: ProductCardProps) {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart();
  };

  const formatPrice = (value: number) => {
    return (value || 0).toLocaleString('ko-KR') + '원';
  };

  return (
    <div className="product-card" onClick={onClick}>
      <div className="product-card__image-container">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name} 
            className="product-card__image"
          />
        ) : (
          <div className="product-card__image-placeholder" />
        )}
        <button 
          className="product-card__add-button"
          onClick={handleAddToCart}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5.33333 14.6667C5.88562 14.6667 6.33333 14.219 6.33333 13.6667C6.33333 13.1144 5.88562 12.6667 5.33333 12.6667C4.78105 12.6667 4.33333 13.1144 4.33333 13.6667C4.33333 14.219 4.78105 14.6667 5.33333 14.6667Z" fill="#0C0C0C"/>
            <path d="M12 14.6667C12.5523 14.6667 13 14.219 13 13.6667C13 13.1144 12.5523 12.6667 12 12.6667C11.4477 12.6667 11 13.1144 11 13.6667C11 14.219 11.4477 14.6667 12 14.6667Z" fill="#0C0C0C"/>
            <path d="M1.33333 1.33333H3.33333L5.12 9.59333C5.17918 9.86583 5.32876 10.1108 5.54428 10.2872C5.75979 10.4636 6.02806 10.5612 6.30667 10.5667H11.68C11.9586 10.5612 12.2269 10.4636 12.4424 10.2872C12.6579 10.1108 12.8075 9.86583 12.8667 9.59333L14 4.33333H4.05333" stroke="#0C0C0C" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>담기</span>
        </button>
      </div>
      <div className="product-card__info">
        <p className="product-card__name">{name || '상품명 없음'}</p>
        <div className="product-card__price-row">
          {discountRate > 0 && (
            <span className="product-card__discount">{discountRate}%</span>
          )}
          <span className="product-card__price">{formatPrice(price)}</span>
        </div>
      </div>
    </div>
  );
}
