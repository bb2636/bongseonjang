import { ChangeEvent } from 'react';
import { Input } from '@components';
import './PasswordResetRequestView.css';

interface PasswordResetRequestViewProps {
  email: string;
  error: string | null;
  isLoading: boolean;
  isValid: boolean;
  isSuccess: boolean;
  socialProvider: 'kakao' | 'naver' | null;
  onEmailChange: (value: string) => void;
  onEmailBlur: () => void;
  onSubmit: () => void;
  onBack: () => void;
}

function getSocialProviderMessage(provider: 'kakao' | 'naver'): string {
  const providerName = provider === 'kakao' ? '카카오톡' : '네이버';
  return `${providerName} 간편 가입으로 가입한 계정입니다. 비밀번호 찾기는 '이메일 가입하기'로 가입한 경우에만 가능합니다.`;
}

export default function PasswordResetRequestView({
  email,
  error,
  isLoading,
  isSuccess,
  socialProvider,
  onEmailChange,
  onEmailBlur,
  onSubmit,
  onBack,
}: PasswordResetRequestViewProps) {
  if (isSuccess) {
    return (
      <div className="password-reset-request-container">
        <header className="password-reset-request-header">
          <button className="password-reset-request-back-button" onClick={onBack} aria-label="뒤로가기">
            <span className="password-reset-request-back-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
          <h1 className="password-reset-request-header-title">비밀번호 찾기</h1>
          <div className="password-reset-request-header-spacer" />
        </header>

        <main className="password-reset-request-content">
          <div className="password-reset-request-success">
            <div className="password-reset-request-success-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="#E8F5E9"/>
                <path d="M20 24L23 27L28 21" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="password-reset-request-success-message">
              이메일로 비밀번호 재설정 링크가 발송되었습니다.
            </p>
            <p className="password-reset-request-success-hint">
              이메일을 확인해 주세요.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="password-reset-request-container">
      <header className="password-reset-request-header">
        <button className="password-reset-request-back-button" onClick={onBack} aria-label="뒤로가기">
          <span className="password-reset-request-back-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </button>
        <h1 className="password-reset-request-header-title">비밀번호 찾기</h1>
        <div className="password-reset-request-header-spacer" />
      </header>

      <main className="password-reset-request-content">
        <div className="password-reset-request-form">
          <p className="password-reset-request-description">
            가입하신 이메일 주소를 입력해주세요.<br />
            비밀번호 재설정 링크를 보내드립니다.
          </p>

          <div className="password-reset-request-input-group">
            <div className={`password-reset-request-input-wrapper ${socialProvider ? 'password-reset-request-input-wrapper--social' : ''}`}>
              <Input
                label="이메일"
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onEmailChange(e.target.value)}
                onBlur={onEmailBlur}
                error={socialProvider ? undefined : error}
              />
            </div>
            {socialProvider && (
              <p className="password-reset-request-social-message">
                {getSocialProviderMessage(socialProvider)}
              </p>
            )}
          </div>

          <button 
            className="password-reset-request-submit"
            onClick={onSubmit}
            disabled={isLoading || !!socialProvider}
          >
            {isLoading ? '발송 중...' : '재설정 링크 보내기'}
          </button>
        </div>
      </main>
    </div>
  );
}
