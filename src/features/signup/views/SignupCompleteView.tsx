import successImage from '@assets/image/sucess.svg';
import type { ConfettiPiece } from '../hooks/useSignupCompletePage';
import './SignupCompleteView.css';

interface SignupCompleteViewProps {
  complete: {
    confettiPieces: ConfettiPiece[];
    onLoginClick: () => void;
  };
}

export default function SignupCompleteView({ complete }: SignupCompleteViewProps) {
  return (
    <div className="signup-complete-container">
      <div className="signup-complete-confetti-container">
        {complete.confettiPieces.map(piece => (
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
        <button className="signup-complete-login-button" onClick={complete.onLoginClick}>
          <span className="signup-complete-button-text">로그인</span>
        </button>
      </div>
    </div>
  );
}
