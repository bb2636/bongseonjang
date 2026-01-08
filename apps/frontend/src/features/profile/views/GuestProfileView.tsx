import { useNavigate } from 'react-router-dom';
import AppBar from '../../../components/AppBar/AppBar';
import BottomNav from '../../../components/BottomNav/BottomNav';
import { MypageBanner } from '../components/MypageBanner';
import './GuestProfileView.css';

export default function GuestProfileView() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleOrderLookupClick = () => {
    navigate('/orders/guest');
  };

  return (
    <div className="guest-profile-view">
      <AppBar />
      
      <main className="guest-profile-view__content">
        <div className="guest-profile-view__buttons">
          <button
            type="button"
            className="guest-profile-view__button guest-profile-view__button--primary"
            onClick={handleLoginClick}
          >
            로그인
          </button>
          <button
            type="button"
            className="guest-profile-view__button guest-profile-view__button--secondary"
            onClick={handleOrderLookupClick}
          >
            주문조회
          </button>
        </div>
      </main>

      <MypageBanner />
      <BottomNav />
    </div>
  );
}
