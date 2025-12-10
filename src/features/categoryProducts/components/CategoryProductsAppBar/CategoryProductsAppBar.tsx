import './CategoryProductsAppBar.css';

interface CategoryProductsAppBarProps {
  cartCount?: number;
  onCartClick: () => void;
  onBack: () => void;
}

export default function CategoryProductsAppBar({ 
  cartCount = 0, 
  onCartClick, 
  onBack 
}: CategoryProductsAppBarProps) {
  return (
    <header className="category-products-appbar">
      <button className="category-products-appbar__back" onClick={onBack}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div className="category-products-appbar__spacer" />
      <button className="category-products-appbar__cart" onClick={onCartClick}>
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
          <span className="category-products-appbar__cart-badge">{cartCount}</span>
        )}
      </button>
    </header>
  );
}
