import { useNavigate } from 'react-router-dom';
import './PaymentSuccessMemberDemo.css';

export function PaymentSuccessMemberDemoPage() {
  const navigate = useNavigate();

  return (
    <div className="member-success-page">
      <div className="member-success-content">
        <div className="member-success-character">
          <img src="/images/character.png" alt="캐릭터" width="100" height="100" />
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
