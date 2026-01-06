import { useNavigate } from 'react-router-dom';
import './PaymentSuccessMemberDemo.css';

export function PaymentSuccessMemberDemoPage() {
  const navigate = useNavigate();

  return (
    <div className="member-success-page">
      <div className="member-success-content">
        <div className="member-success-character">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="60" cy="95" rx="35" ry="8" fill="#E8F4FC" />
            <path d="M30 55C30 35 45 20 60 20C75 20 90 35 90 55C90 75 75 90 60 90C45 90 30 75 30 55Z" fill="#FFE4C4"/>
            <path d="M25 45C25 45 30 25 60 20C90 25 95 45 95 45C95 45 85 35 60 35C35 35 25 45 25 45Z" fill="#3B9BD5"/>
            <path d="M20 50C20 50 25 30 60 25C95 30 100 50 100 50L95 55C95 55 85 40 60 40C35 40 25 55 25 55L20 50Z" fill="#3B9BD5"/>
            <circle cx="45" cy="55" r="12" fill="white" stroke="#333" strokeWidth="2"/>
            <circle cx="75" cy="55" r="12" fill="white" stroke="#333" strokeWidth="2"/>
            <circle cx="45" cy="55" r="4" fill="#333"/>
            <circle cx="75" cy="55" r="4" fill="#333"/>
            <path d="M33 52C33 52 38 48 45 48" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
            <path d="M87 52C87 52 82 48 75 48" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
            <path d="M50 72C50 72 55 78 60 78C65 78 70 72 70 72" stroke="#333" strokeWidth="2" strokeLinecap="round" fill="none"/>
            <ellipse cx="35" cy="65" rx="5" ry="3" fill="#FFB6C1" opacity="0.5"/>
            <ellipse cx="85" cy="65" rx="5" ry="3" fill="#FFB6C1" opacity="0.5"/>
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
