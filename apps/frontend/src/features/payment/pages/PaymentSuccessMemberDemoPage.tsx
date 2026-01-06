import { useNavigate } from 'react-router-dom';
import './PaymentSuccessMemberDemo.css';

export function PaymentSuccessMemberDemoPage() {
  const navigate = useNavigate();

  return (
    <div className="member-success-page">
      <div className="member-success-content">
        <div className="member-success-character">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="58" rx="32" ry="30" fill="#FFECD2"/>
            <path d="M18 48C18 48 22 28 50 24C78 28 82 48 82 48C82 48 75 38 50 38C25 38 18 48 18 48Z" fill="#4AADE8"/>
            <path d="M14 42C14 42 20 18 50 14C80 18 86 42 86 42L82 48C82 48 74 32 50 32C26 32 18 48 18 48L14 42Z" fill="#4AADE8"/>
            <circle cx="36" cy="54" r="10" fill="white" stroke="#2C2C2C" strokeWidth="2"/>
            <circle cx="64" cy="54" r="10" fill="white" stroke="#2C2C2C" strokeWidth="2"/>
            <circle cx="36" cy="54" r="3" fill="#2C2C2C"/>
            <circle cx="64" cy="54" r="3" fill="#2C2C2C"/>
            <line x1="46" y1="54" x2="54" y2="54" stroke="#2C2C2C" strokeWidth="2"/>
            <path d="M40 70C40 70 45 76 50 76C55 76 60 70 60 70" stroke="#2C2C2C" strokeWidth="2" strokeLinecap="round" fill="none"/>
          </svg>
        </div>
        
        <h1 className="member-success-title">결제완료!</h1>
        <p className="member-success-subtitle">신선한 바다가 곧 찾아갑니다</p>
        
        <button
          className="member-success-link"
          onClick={() => navigate('/orders')}
        >
          주문내역 확인하기
        </button>
      </div>
      
      <div className="member-success-footer">
        <button
          className="member-success-home-button"
          onClick={() => navigate('/')}
        >
          홈으로
        </button>
      </div>
    </div>
  );
}
