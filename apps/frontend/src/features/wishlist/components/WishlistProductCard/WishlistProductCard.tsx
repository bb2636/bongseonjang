import type { WishlistItem } from '../../api/wishlistApi';
import './WishlistProductCard.css';

interface WishlistProductCardProps {
  item: WishlistItem;
  onRemove: () => void;
  onAddToCart: () => void;
  onClick: () => void;
}

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

export default function WishlistProductCard({ 
  item, 
  onRemove, 
  onAddToCart,
  onClick,
}: WishlistProductCardProps) {
  const handleCardClick = () => {
    onClick();
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart();
  };

  return (
    <div className="wishlist-product-card" onClick={handleCardClick}>
      <div className="wishlist-product-card__image">
        {item.thumbnailUrl && (
          <img src={item.thumbnailUrl} alt={item.name} />
        )}
        <button
          type="button"
          className="wishlist-product-card__heart-button"
          onClick={handleRemoveClick}
          aria-label="찜 삭제"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              fill="#FF4D4D"
              stroke="#FF4D4D"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <button
        type="button"
        className="wishlist-product-card__add-button"
        onClick={handleAddToCartClick}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.48C20.96 5.34 21 5.17 21 5C21 4.45 20.55 4 20 4H5.21L4.27 2H1ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18Z"
            fill="currentColor"
          />
        </svg>
        <span>담기</span>
      </button>

      <div className="wishlist-product-card__info">
        <span className="wishlist-product-card__name">{item.name}</span>
        <div className="wishlist-product-card__price-row">
          {item.discountRate > 0 && (
            <span className="wishlist-product-card__discount">{item.discountRate}%</span>
          )}
          <span className="wishlist-product-card__price">{formatPrice(item.discountedPrice)}원</span>
        </div>
      </div>
    </div>
  );
}
