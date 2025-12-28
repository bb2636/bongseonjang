import './ProductInfo.css';

interface ProductInfoProps {
  name: string;
  basePrice: number;
  discountedPrice: number;
  discountRate: number;
  isDiscounted: boolean;
  reviewCount: number;
  averageRating: number;
  onShare?: () => void;
  onReviewClick?: () => void;
}

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg 
      width="12" 
      height="12" 
      viewBox="0 0 12 12" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.51L6 8.885L2.91 10.51L3.5 7.07L1 4.635L4.455 4.13L6 1Z"
        fill={filled ? '#3B9BD5' : '#D9D9D9'}
      />
    </svg>
  );
}

export default function ProductInfo({
  name,
  basePrice,
  discountedPrice,
  discountRate,
  isDiscounted,
  reviewCount,
  averageRating,
  onShare,
  onReviewClick,
}: ProductInfoProps) {
  const filledStars = Math.round(averageRating);

  return (
    <div className="product-info">
      <div className="product-info__header">
        <h1 className="product-info__name">{name}</h1>
        <button className="product-info__share-button" onClick={onShare}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="rgba(12, 12, 12, 0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 6L12 2L8 6" stroke="rgba(12, 12, 12, 0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 2V15" stroke="rgba(12, 12, 12, 0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <button 
        type="button" 
        className="product-info__rating" 
        onClick={onReviewClick}
      >
        <div className="product-info__stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon key={star} filled={star <= filledStars} />
          ))}
        </div>
        <span className="product-info__review-count">({reviewCount})</span>
      </button>

      <div className="product-info__price">
        {isDiscounted && (
          <div className="product-info__price-row">
            <span className="product-info__discount-rate">{discountRate}%</span>
            <span className="product-info__original-price">
              {formatPrice(basePrice)}
            </span>
          </div>
        )}
        <span className="product-info__discounted-price">
          {formatPrice(discountedPrice)}원
        </span>
      </div>
    </div>
  );
}
