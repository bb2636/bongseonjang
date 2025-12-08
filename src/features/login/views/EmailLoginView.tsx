import { ChangeEvent } from 'react';
import { Input, PasswordInput } from '@components';
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
            <Input
              label="이메일"
              type="email"
              placeholder="이메일"
              value={emailLogin.email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => emailLogin.onEmailChange(e.target.value)}
              onBlur={emailLogin.onEmailBlur}
              error={emailLogin.errors.email}
            />

            <PasswordInput
              label="비밀번호"
              placeholder="비밀번호"
              value={emailLogin.password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => emailLogin.onPasswordChange(e.target.value)}
              onBlur={emailLogin.onPasswordBlur}
              error={emailLogin.errors.password}
            />
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
