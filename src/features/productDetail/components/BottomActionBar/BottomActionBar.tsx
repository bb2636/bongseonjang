import './BottomActionBar.css';

interface BottomActionBarProps {
  totalPrice: number;
  isWishlisted: boolean;
  onWishlistClick: () => void;
  onCartClick: () => void;
  onBuyClick: () => void;
}

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

export default function BottomActionBar({
  totalPrice,
  isWishlisted,
  onWishlistClick,
  onCartClick,
  onBuyClick,
}: BottomActionBarProps) {
  return (
    <div className="bottom-action-bar">
      <div className="bottom-action-bar__content">
        <button 
          className={`bottom-action-bar__wishlist ${isWishlisted ? 'bottom-action-bar__wishlist--active' : ''}`}
          onClick={onWishlistClick}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M20.84 4.61C20.3292 4.099 19.7228 3.69365 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69365 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22249 22.4518 8.5C22.4518 7.77751 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.61Z" 
              stroke={isWishlisted ? '#E53935' : 'rgba(12, 12, 12, 0.6)'}
              fill={isWishlisted ? '#E53935' : 'none'}
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button className="bottom-action-bar__cart" onClick={onCartClick}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>장바구니</span>
        </button>

        <button className="bottom-action-bar__buy" onClick={onBuyClick}>
          <span className="bottom-action-bar__price">{formatPrice(totalPrice)}원</span>
          <span className="bottom-action-bar__buy-text">구매하기</span>
        </button>
      </div>
    </div>
  );
}
