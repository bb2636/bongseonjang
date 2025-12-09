import './HomeAppBar.css';

interface HomeAppBarProps {
  onCartClick?: () => void;
}

export default function HomeAppBar({ onCartClick }: HomeAppBarProps) {
  return (
    <header className="home-app-bar">
      <span className="home-app-bar__title">봉선장</span>
      <button 
        className="home-app-bar__cart-button" 
        onClick={onCartClick}
        aria-label="장바구니"
      >
        <svg 
          className="home-app-bar__cart-icon" 
          width="26" 
          height="26" 
          viewBox="0 0 26 26" 
          fill="none"
        >
          <path 
            d="M6.5 7.58333V6.5C6.5 5.30653 6.97411 4.16193 7.81802 3.31802C8.66193 2.47411 9.80653 2 11 2H15C16.1935 2 17.3381 2.47411 18.182 3.31802C19.0259 4.16193 19.5 5.30653 19.5 6.5V7.58333M3.25 7.58333H22.75V21.6667C22.75 22.2413 22.5217 22.7924 22.1154 23.1987C21.7091 23.605 21.158 23.8333 20.5833 23.8333H5.41667C4.84203 23.8333 4.29093 23.605 3.88461 23.1987C3.47827 22.7924 3.25 22.2413 3.25 21.6667V7.58333Z" 
            stroke="rgba(12, 12, 12, 0.9)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </header>
  );
}
