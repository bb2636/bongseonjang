import './LoginView.css';
import socialLoginLogo from '@/assets/images/social-login-logo.png';

interface LoginViewProps {
  login: {
    onKakaoLogin: () => void;
    onNaverLogin: () => void;
    onGoogleLogin: () => void;
    onAppleLogin: () => void;
    onEmailLogin: () => void;
    onEmailSignup: () => void;
    onGuestOrder: () => void;
    onBrowse: () => void;
  };
}

export default function LoginView({ login }: LoginViewProps) {
  return (
    <div className="login-container">
      <header className="login-header">
        <button className="login-browse-button" onClick={login.onBrowse}>
          둘러보기
        </button>
        <div className="login-header-placeholder" />
      </header>
      <div className="login-header-spacer" />

      <main className="login-content">
        <div className="login-logo-section">
          <img className="login-logo-image" src={socialLoginLogo} alt="봉선장" />
          <h1 className="login-logo-text">봉선장</h1>
        </div>

        <div className="login-button-section">
          <div className="login-social-buttons">
            <button className="login-social-button login-kakao-button" onClick={login.onKakaoLogin}>
              <span className="login-kakao-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M9 0.5C4.029 0.5 0 3.638 0 7.5C0 9.927 1.558 12.074 3.931 13.335L2.931 16.792C2.859 17.047 3.146 17.254 3.369 17.109L7.491 14.394C7.988 14.464 8.493 14.5 9 14.5C13.971 14.5 18 11.362 18 7.5C18 3.638 13.971 0.5 9 0.5Z" fill="#3D1D1C"/>
                </svg>
              </span>
              <span className="login-button-text login-button-text--kakao">카카오톡으로 계속하기</span>
            </button>

            <button className="login-social-button login-naver-button" onClick={login.onNaverLogin}>
              <span className="login-naver-icon">N</span>
              <span className="login-button-text login-button-text--naver">네이버로 계속하기</span>
            </button>

            <button className="login-social-button login-google-button" onClick={login.onGoogleLogin}>
              <span className="login-google-icon">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M13.545 7.159c0-.495-.045-.97-.128-1.427H7v2.7h3.674a3.14 3.14 0 01-1.363 2.06v1.713h2.206c1.291-1.19 2.028-2.94 2.028-5.046z" fill="#4285F4"/>
                  <path d="M7 14c1.845 0 3.393-.612 4.524-1.657l-2.206-1.713c-.612.41-1.395.653-2.318.653-1.782 0-3.293-1.203-3.831-2.821H.892v1.77A6.998 6.998 0 007 14z" fill="#34A853"/>
                  <path d="M3.169 8.462A4.21 4.21 0 012.95 7c0-.507.087-.999.219-1.462v-1.77H.892A6.998 6.998 0 000 7c0 1.13.27 2.198.892 3.232l2.277-1.77z" fill="#FBBC05"/>
                  <path d="M7 2.717c1.005 0 1.907.345 2.617 1.023l1.962-1.962C10.39.673 8.845 0 7 0A6.998 6.998 0 00.892 3.768l2.277 1.77C3.707 3.92 5.218 2.717 7 2.717z" fill="#EA4335"/>
                </svg>
              </span>
              <span className="login-button-text login-button-text--google">구글로 계속하기</span>
            </button>

            <button className="login-social-button login-apple-button" onClick={login.onAppleLogin}>
              <span className="login-apple-icon">
                <svg width="14" height="17" viewBox="0 0 14 17" fill="none">
                  <path d="M13.545 12.813c-.341.785-.505 1.135-.943 1.832-.612.97-1.475 2.178-2.542 2.188-.949.01-1.193-.618-2.481-.61-1.289.008-1.556.622-2.506.612-1.066-.01-1.88-1.101-2.492-2.07C.908 12.222.282 9.203 1.036 7.177c.529-1.421 1.475-2.39 2.536-2.39 1.001 0 1.63.621 2.458.621.804 0 1.294-.622 2.453-.622.944 0 1.78.514 2.302 1.322-2.022 1.109-1.693 3.997.76 4.705zM9.5 3.24c.474-.609.834-1.47.703-2.35-.776.05-1.682.517-2.213 1.133-.48.556-.877 1.41-.724 2.254.846.026 1.722-.452 2.234-1.037z" fill="#FFFFFF"/>
                </svg>
              </span>
              <span className="login-button-text login-button-text--apple">애플로 계속하기</span>
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
