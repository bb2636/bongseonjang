import './SearchAppBar.css';

interface SearchAppBarProps {
  cartCount?: number;
  onCartClick: () => void;
}

export default function SearchAppBar({ 
  cartCount = 0, 
  onCartClick 
}: SearchAppBarProps) {
  return (
    <header className="search-appbar">
      <div className="search-appbar__logo">
        <svg width="46" height="16" viewBox="0 0 46 16" fill="none">
          <path d="M0 0.5H5V15.5H0V0.5Z" fill="#3B9BD5"/>
          <path d="M15.33 0.5H20.33V15.5H15.33V0.5Z" fill="#3B9BD5"/>
          <path d="M30.67 0.5H35.67V15.5H30.67V0.5Z" fill="#3B9BD5"/>
        </svg>
      </div>
      <button className="search-appbar__cart" onClick={onCartClick}>
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <path 
            d="M6.5 7.58333V6.5C6.5 5.30653 6.97411 4.16193 7.81802 3.31802C8.66193 2.47411 9.80653 2 11 2H15C16.1935 2 17.3381 2.47411 18.182 3.31802C19.0259 4.16193 19.5 5.30653 19.5 6.5V7.58333M3.25 7.58333H22.75V21.6667C22.75 22.2413 22.5217 22.7924 22.1154 23.1987C21.7091 23.605 21.158 23.8333 20.5833 23.8333H5.41667C4.84203 23.8333 4.29093 23.605 3.88461 23.1987C3.47827 22.7924 3.25 22.2413 3.25 21.6667V7.58333Z" 
            stroke="rgba(12, 12, 12, 0.9)" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
        {cartCount > 0 && (
          <span className="search-appbar__cart-badge">{cartCount}</span>
        )}
      </button>
    </header>
  );
}
