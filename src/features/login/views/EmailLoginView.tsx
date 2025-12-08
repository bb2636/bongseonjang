import { useState, ChangeEvent } from 'react';
import './EmailLoginView.css';

interface EmailLoginViewProps {
  emailLogin: {
    email: string;
    password: string;
    isLoading: boolean;
    isValid: boolean;
    errors: {
      email: string | null;
      password: string | null;
    };
    onEmailChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onEmailBlur: () => void;
    onPasswordBlur: () => void;
    onSubmit: () => void;
    onForgotPassword: () => void;
    onBack: () => void;
  };
}

export default function EmailLoginView({ emailLogin }: EmailLoginViewProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="email-login-container">
      <header className="email-login-header">
        <button className="email-login-back-button" onClick={emailLogin.onBack} aria-label="뒤로가기">
          <span className="email-login-back-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </button>
        <h1 className="email-login-header-title">이메일로 로그인</h1>
        <div className="email-login-header-spacer" />
      </header>

      <main className="email-login-content">
        <div className="email-login-form">
          <div className="email-login-input-group">
            <div className="email-login-text-field">
              <label className="email-login-label">이메일</label>
              <div className={`email-login-input-box ${emailLogin.errors.email ? 'email-login-input-box--error' : ''}`}>
                <input
                  className="email-login-input"
                  type="email"
                  placeholder="이메일"
                  value={emailLogin.email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => emailLogin.onEmailChange(e.target.value)}
                  onBlur={emailLogin.onEmailBlur}
                />
                {emailLogin.errors.email && (
                  <span className="email-login-error">{emailLogin.errors.email}</span>
                )}
              </div>
            </div>

            <div className="email-login-text-field">
              <label className="email-login-label">비밀번호</label>
              <div className={`email-login-input-box ${emailLogin.errors.password ? 'email-login-input-box--error' : ''}`}>
                <div className="email-login-input-row">
                  <input
                    className="email-login-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호"
                    value={emailLogin.password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => emailLogin.onPasswordChange(e.target.value)}
                    onBlur={emailLogin.onPasswordBlur}
                  />
                  <button 
                    className="email-login-visibility-button"
                    type="button"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  >
                    {showPassword ? (
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                        <path d="M11 4.5C6 4.5 2 11 2 11C2 11 6 17.5 11 17.5C16 17.5 20 11 20 11C20 11 16 4.5 11 4.5Z" stroke="rgba(12, 12, 12, 0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="11" cy="11" r="3" stroke="rgba(12, 12, 12, 0.4)" strokeWidth="1.5"/>
                      </svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                        <path d="M11 4.5C6 4.5 2 11 2 11C2 11 6 17.5 11 17.5C16 17.5 20 11 20 11C20 11 16 4.5 11 4.5Z" stroke="rgba(12, 12, 12, 0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="11" cy="11" r="3" stroke="rgba(12, 12, 12, 0.4)" strokeWidth="1.5"/>
                        <line x1="3" y1="19" x2="19" y2="3" stroke="rgba(12, 12, 12, 0.4)" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                </div>
                {emailLogin.errors.password && (
                  <span className="email-login-error">{emailLogin.errors.password}</span>
                )}
              </div>
            </div>
          </div>

          <button 
            className="email-login-submit"
            onClick={emailLogin.onSubmit}
            disabled={emailLogin.isLoading}
          >
            {emailLogin.isLoading ? '로그인 중...' : '로그인'}
          </button>
        </div>

        <button className="email-login-forgot" onClick={emailLogin.onForgotPassword}>
          비밀번호를 잊어버렸어요
        </button>
      </main>
    </div>
  );
}
