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
          <path d="M8.66667 23.8334C9.5871 23.8334 10.3333 23.0872 10.3333 22.1667C10.3333 21.2463 9.5871 20.5001 8.66667 20.5001C7.74619 20.5001 7 21.2463 7 22.1667C7 23.0872 7.74619 23.8334 8.66667 23.8334Z" fill="rgba(12, 12, 12, 0.9)"/>
          <path d="M19.5 23.8334C20.4205 23.8334 21.1667 23.0872 21.1667 22.1667C21.1667 21.2463 20.4205 20.5001 19.5 20.5001C18.5795 20.5001 17.8333 21.2463 17.8333 22.1667C17.8333 23.0872 18.5795 23.8334 19.5 23.8334Z" fill="rgba(12, 12, 12, 0.9)"/>
          <path d="M2.16667 2.16675H5.5L8.36 15.4534C8.45878 15.9187 8.71315 16.3362 9.08142 16.6358C9.44968 16.9355 9.90959 17.0993 10.3833 17.1001H19.0167C19.4904 17.0993 19.9503 16.9355 20.3186 16.6358C20.6868 16.3362 20.9412 15.9187 21.04 15.4534L22.7667 7.00008H6.58333" stroke="rgba(12, 12, 12, 0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {cartCount > 0 && (
          <span className="category-products-appbar__cart-badge">{cartCount}</span>
        )}
      </button>
    </header>
  );
}
