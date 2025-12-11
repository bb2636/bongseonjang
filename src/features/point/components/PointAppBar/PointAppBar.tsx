import './PointAppBar.css';

interface PointAppBarProps {
  onBackClick: () => void;
  onCartClick: () => void;
  cartCount?: number;
}

export default function PointAppBar({ onBackClick, onCartClick, cartCount = 0 }: PointAppBarProps) {
  return (
    <header className="point-app-bar">
      <button
        type="button"
        className="point-app-bar__back-button"
        onClick={onBackClick}
        aria-label="뒤로가기"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18L9 12L15 6"
            stroke="#101112"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      
      <h1 className="point-app-bar__title">포인트</h1>
      
      <button
        type="button"
        className="point-app-bar__cart-button"
        onClick={onCartClick}
        aria-label="장바구니"
      >
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <path
            d="M6.5 7.58333H21.6667L19.5 15.1667H8.66667L6.5 7.58333Z"
            stroke="rgba(12, 12, 12, 0.9)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.5 7.58333L5.41667 4.33333H3.25"
            stroke="rgba(12, 12, 12, 0.9)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="10.8333" cy="19.5" r="1.625" stroke="rgba(12, 12, 12, 0.9)" strokeWidth="1.5" />
          <circle cx="17.3333" cy="19.5" r="1.625" stroke="rgba(12, 12, 12, 0.9)" strokeWidth="1.5" />
        </svg>
        {cartCount > 0 && (
          <span className="point-app-bar__cart-badge">{cartCount}</span>
        )}
      </button>
    </header>
  );
}
