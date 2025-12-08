import { useNavigate } from 'react-router-dom';
import successImage from '@assets/image/sucess.svg';
import './SignupCompletePage.css';

const confettiColors = ['#3B9BD5', '#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181'];

export default function SignupCompletePage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    sessionStorage.removeItem('signupFormData');
    navigate('/login');
  };

  const confettiPieces = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    left: Math.random() * 100,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
  }));

  return (
    <div className="signup-complete-container">
      <div className="signup-complete-confetti-container">
        {confettiPieces.map(piece => (
          <div
            key={piece.id}
            className="signup-complete-confetti"
            style={{
              background: piece.color,
              left: `${piece.left}%`,
              animationDelay: `${piece.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="signup-complete-content">
        <img
          className="signup-complete-mascot-image"
          src={successImage}
          alt="회원가입 완료"
        />

        <div className="signup-complete-message-container">
          <h1 className="signup-complete-title">회원가입 완료!</h1>
          <p className="signup-complete-subtitle">신선한 바다를 집에서 만나보세요</p>
        </div>
      </div>

      <div className="signup-complete-button-container">
        <button className="signup-complete-login-button" onClick={handleLoginClick}>
          <span className="signup-complete-button-text">로그인</span>
        </button>
      </div>
    </div>
  );
}
