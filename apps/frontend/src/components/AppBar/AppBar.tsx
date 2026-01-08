import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts';
import { useGoBack } from '../../hooks/useGoBack';
import './AppBar.css';

interface AppBarSpacerProps {
  variant?: 'default' | 'subpage';
}

export function AppBarSpacer({ variant = 'default' }: AppBarSpacerProps) {
  const className = variant === 'subpage' ? 'app-bar-spacer--subpage' : 'app-bar-spacer';
  return <div className={className} />;
}

interface AppBarProps {
  variant?: 'default' | 'subpage';
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showLogo?: boolean;
  onLogoClick?: () => void;
  showCart?: boolean;
  onCartClick?: () => void;
}

export default function AppBar({
  variant = 'default',
  title,
  showBackButton = false,
  onBackClick,
  showLogo = true,
  onLogoClick,
  showCart = true,
  onCartClick,
}: AppBarProps) {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const goBack = useGoBack();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      goBack();
    }
  };

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      navigate('/');
    }
  };

  const handleCartClick = () => {
    if (onCartClick) {
      onCartClick();
    } else {
      navigate('/cart');
    }
  };

  if (variant === 'subpage') {
    return (
      <header className="app-bar app-bar--subpage">
        <button
          type="button"
          className="app-bar__back-button"
          onClick={handleBackClick}
          aria-label="뒤로가기"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="#101112"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span className="app-bar__title app-bar__title--subpage">{title}</span>
        {showCart ? (
          <button
            type="button"
            className="app-bar__cart-button"
            onClick={handleCartClick}
            aria-label="장바구니"
          >
            <svg
              className="app-bar__cart-icon"
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
            {cartCount > 0 && (
              <span className="app-bar__cart-badge">{cartCount}</span>
            )}
          </button>
        ) : (
          <div className="app-bar__placeholder" />
        )}
      </header>
    );
  }

  return (
    <header className="app-bar">
      <div className="app-bar__left">
        {showBackButton && (
          <button 
            type="button"
            className="app-bar__back-button" 
            onClick={handleBackClick}
            aria-label="뒤로가기"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path 
                d="M15 18L9 12L15 6" 
                stroke="#101112" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        {title ? (
          <span className="app-bar__title">{title}</span>
        ) : showLogo ? (
          <button 
            type="button"
            className="app-bar__logo-button"
            onClick={handleLogoClick}
          >
            <span className="app-bar__title">봉선장</span>
          </button>
        ) : null}
      </div>

      <div className="app-bar__right">
        {showCart && (
          <button 
            type="button"
            className="app-bar__cart-button" 
            onClick={handleCartClick}
            aria-label="장바구니"
          >
            <svg 
              className="app-bar__cart-icon" 
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
            {cartCount > 0 && (
              <span className="app-bar__cart-badge">{cartCount}</span>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
