import { useNavigate } from 'react-router-dom';
import AppBar from '../../../components/AppBar/AppBar';
import BottomNav from '../../../components/BottomNav/BottomNav';
import { MyPageBanner } from '../components/MyPageBanner';
import './GuestProfileView.css';

export default function GuestProfileView() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  const handleGuestOrderClick = () => {
    navigate('/orders/guest');
  };

  const handleCustomerServiceClick = () => {
    navigate('/customer-service');
  };

  const handleAboutClick = () => {
    navigate('/about');
  };

  return (
    <div className="guest-profile-view">
      <main className="guest-profile-view__content">
        <section className="guest-profile-view__header">
          <h1 className="guest-profile-view__title">로그인</h1>
          <p className="guest-profile-view__description">
            봉선장의 다양한 혜택을<br />
            만나보세요.
          </p>
          <div className="guest-profile-view__buttons">
            <button
              type="button"
              className="guest-profile-view__button guest-profile-view__button--outline"
              onClick={handleLoginClick}
            >
              로그인
            </button>
            <button
              type="button"
              className="guest-profile-view__button guest-profile-view__button--primary"
              onClick={handleSignupClick}
            >
              회원가입
            </button>
          </div>
        </section>

        <div className="guest-profile-view__divider" />

        <nav className="guest-profile-view__menu">
          <button
            type="button"
            className="guest-profile-view__menu-item"
            onClick={handleGuestOrderClick}
          >
            <span>비회원 주문조회</span>
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M1 1L7 7L1 13" stroke="rgba(12, 12, 12, 0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            type="button"
            className="guest-profile-view__menu-item"
            onClick={handleCustomerServiceClick}
          >
            <span>고객센터</span>
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M1 1L7 7L1 13" stroke="rgba(12, 12, 12, 0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            type="button"
            className="guest-profile-view__menu-item"
            onClick={handleAboutClick}
          >
            <span>봉선장이야기</span>
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M1 1L7 7L1 13" stroke="rgba(12, 12, 12, 0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </nav>

        <div className="guest-profile-view__banner-container">
          <MyPageBanner />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
