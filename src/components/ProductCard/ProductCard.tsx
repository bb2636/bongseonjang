import './ProductCard.css';

export interface ProductCardData {
  id: string;
  name: string;
  imageUrl?: string;
  originalPrice: number;
  discountPercent: number;
  discountedPrice: number;
  isFavorite?: boolean;
}

interface ProductCardProps {
  product: ProductCardData;
  onAddToCart?: () => void;
  onToggleFavorite?: () => void;
  onClick?: () => void;
}

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

export default function ProductCard({
  product,
  onAddToCart,
  onToggleFavorite,
  onClick,
}: ProductCardProps) {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.();
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.();
  };

  return (
    <div className="product-card" onClick={onClick}>
      <div className="product-card__image-container">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-card__image"
          />
        ) : (
          <div className="product-card__image-placeholder" />
        )}
        <button
          type="button"
          className="product-card__favorite-button"
          onClick={handleToggleFavorite}
          aria-label={product.isFavorite ? '찜 해제' : '찜하기'}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={product.isFavorite ? '#3B9BD5' : 'none'}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
              stroke={product.isFavorite ? '#3B9BD5' : '#FDFDFD'}
              strokeWidth="1.5"
              fill={product.isFavorite ? '#3B9BD5' : 'none'}
            />
          </svg>
        </button>
      </div>

      <div className="product-card__content">
        <button
          type="button"
          className="product-card__add-button"
          onClick={handleAddToCart}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.48C20.96 5.34 21 5.17 21 5C21 4.45 20.55 4 20 4H5.21L4.27 2H1ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18Z"
              fill="currentColor"
            />
          </svg>
          <span>담기</span>
        </button>

        <div className="product-card__info">
          <p className="product-card__name">{product.name}</p>
          <div className="product-card__price-row">
            {product.discountPercent > 0 && (
              <span className="product-card__discount">{product.discountPercent}%</span>
            )}
            <span className="product-card__price">{formatPrice(product.discountedPrice)}원</span>
          </div>
        </div>
      </div>
    </div>
  );
}
