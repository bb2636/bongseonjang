import { useGoBack } from '../../../../hooks/useGoBack';
import './CartAppBar.css';

export function CartAppBar() {
  const goBack = useGoBack();

  const handleBack = () => {
    goBack();
  };

  return (
    <header className="cart-app-bar">
      <button className="cart-app-bar__back-button" onClick={handleBack}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <h1 className="cart-app-bar__title">장바구니</h1>
      <div className="cart-app-bar__placeholder" />
    </header>
  );
}

export function CartAppBarSpacer() {
  return <div className="cart-app-bar-spacer" />;
}
