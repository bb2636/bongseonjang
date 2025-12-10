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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M8 22C8.82843 22 9.5 21.3284 9.5 20.5C9.5 19.6716 8.82843 19 8 19C7.17157 19 6.5 19.6716 6.5 20.5C6.5 21.3284 7.17157 22 8 22Z" fill="#1C1B1F"/>
          <path d="M18 22C18.8284 22 19.5 21.3284 19.5 20.5C19.5 19.6716 18.8284 19 18 19C17.1716 19 16.5 19.6716 16.5 20.5C16.5 21.3284 17.1716 22 18 22Z" fill="#1C1B1F"/>
          <path d="M2 2H4.5L7.68 14.39C7.77038 14.7504 7.97571 15.0712 8.26393 15.3018C8.55215 15.5324 8.9079 15.6592 9.27556 15.6619H17.7037C18.0713 15.6592 18.4271 15.5324 18.7153 15.3018C19.0035 15.0712 19.2088 14.7504 19.2992 14.39L21 6.5H6" stroke="#1C1B1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {cartCount > 0 && (
          <span className="search-appbar__cart-badge">{cartCount}</span>
        )}
      </button>
    </header>
  );
}
