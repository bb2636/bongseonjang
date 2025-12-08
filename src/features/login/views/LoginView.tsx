import './LoginView.css';

interface LoginViewProps {
  login: {
    onKakaoLogin: () => void;
    onNaverLogin: () => void;
    onEmailLogin: () => void;
    onEmailSignup: () => void;
    onGuestOrder: () => void;
    onClose: () => void;
  };
}

export default function LoginView({ login }: LoginViewProps) {
  return (
    <div className="login-container">
      <header className="login-header">
        <button className="login-close-button" onClick={login.onClose} aria-label="닫기">
          <span className="login-close-icon">&times;</span>
        </button>
      </header>

      <main className="login-content">
        <div className="login-logo-section">
          <div className="login-logo-circle">
            <img className="login-logo-image" src="/logo.svg" alt="봉선장" />
          </div>
          <h1 className="login-logo-text">봉선장</h1>
        </div>

        <div className="login-button-section">
          <div className="login-social-buttons">
            <button className="login-social-button login-kakao-button" onClick={login.onKakaoLogin}>
              <span className="login-kakao-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M9 0.5C4.029 0.5 0 3.638 0 7.5C0 9.927 1.558 12.074 3.931 13.335L2.931 16.792C2.859 17.047 3.146 17.254 3.369 17.109L7.491 14.394C7.988 14.464 8.493 14.5 9 14.5C13.971 14.5 18 11.362 18 7.5C18 3.638 13.971 0.5 9 0.5Z" fill="rgba(0, 0, 0, 0.85)"/>
                </svg>
              </span>
              <span className="login-button-text login-button-text--kakao">카카오톡으로 계속하기</span>
            </button>

            <button className="login-social-button login-naver-button" onClick={login.onNaverLogin}>
              <span className="login-naver-icon">N</span>
              <span className="login-button-text login-button-text--naver">네이버로 계속하기</span>
            </button>
          </div>

          <div className="login-email-links">
            <button className="login-email-link" onClick={login.onEmailLogin}>이메일로 로그인</button>
            <span className="login-divider">|</span>
            <button className="login-email-link" onClick={login.onEmailSignup}>이메일로 회원가입</button>
          </div>
        </div>
      </main>

      <footer className="login-footer">
        <button className="login-guest-link" onClick={login.onGuestOrder}>비회원 주문 조회하기</button>
      </footer>
    </div>
  );
}
