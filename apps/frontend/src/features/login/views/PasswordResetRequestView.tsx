import { ChangeEvent } from 'react';
import { PasswordInput } from '@components';
import './PasswordResetRequestView.css';

type Step = 'email' | 'emailVerified' | 'codeSent' | 'codeVerified';

interface PasswordResetRequestViewProps {
  step: Step;
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
  emailError: string | null;
  codeError: string | null;
  passwordError: string | null;
  socialProvider: 'kakao' | 'naver' | null;
  isCheckingEmail: boolean;
  isSendingCode: boolean;
  isVerifyingCode: boolean;
  isChangingPassword: boolean;
  isComplete: boolean;
  timerFormatted: string;
  timerSeconds: number;
  canSendCode: boolean;
  onEmailChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onCheckEmail: () => void;
  onSendCode: () => void;
  onVerifyCode: () => void;
  onChangePassword: () => void;
  onBack: () => void;
  onGoToLogin: () => void;
}

function getSocialProviderMessage(provider: 'kakao' | 'naver'): string {
  const providerName = provider === 'kakao' ? '카카오톡' : '네이버';
  return `${providerName} 간편 가입으로 가입한 계정입니다. 비밀번호 찾기는 '이메일 가입하기'로 가입한 경우에만 가능합니다.`;
}

export default function PasswordResetRequestView({
  step,
  email,
  code,
  newPassword,
  confirmPassword,
  emailError,
  codeError,
  passwordError,
  socialProvider,
  isCheckingEmail,
  isSendingCode,
  isVerifyingCode,
  isChangingPassword,
  isComplete,
  timerFormatted,
  timerSeconds,
  canSendCode,
  onEmailChange,
  onCodeChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onCheckEmail,
  onSendCode,
  onVerifyCode,
  onChangePassword,
  onBack,
  onGoToLogin,
}: PasswordResetRequestViewProps) {
  const isEmailVerified = step === 'emailVerified' || step === 'codeSent' || step === 'codeVerified';
  const showCodeSection = step === 'codeSent' || step === 'codeVerified';
  const isCodeVerified = step === 'codeVerified';
  const showPasswordSection = step === 'codeVerified';

  if (isComplete) {
    return (
      <div className="password-reset-container">
        <header className="password-reset-header">
          <button className="password-reset-back-button" onClick={onGoToLogin} aria-label="뒤로가기">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="password-reset-header-title">새 비밀번호 만들기</h1>
          <div className="password-reset-header-spacer" />
        </header>

        <main className="password-reset-content">
          <div className="password-reset-success">
            <div className="password-reset-success-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="#E8F5E9"/>
                <path d="M20 24L23 27L28 21" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="password-reset-success-message">
              비밀번호가 성공적으로 변경되었습니다
            </p>
            <button 
              className="password-reset-submit password-reset-submit--active"
              onClick={onGoToLogin}
            >
              로그인하기
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="password-reset-container">
      <header className="password-reset-header">
        <button className="password-reset-back-button" onClick={onBack} aria-label="뒤로가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="password-reset-header-title">새 비밀번호 만들기</h1>
        <div className="password-reset-header-spacer" />
      </header>

      <main className="password-reset-content">
        <div className="password-reset-form">
          <div className="password-reset-section">
            <label className="password-reset-label">가입한 이메일 주소를 입력해주세요</label>
            <div className={`password-reset-input-row ${socialProvider ? 'password-reset-input-row--error' : ''}`}>
              <input
                type="email"
                className={`password-reset-input ${isEmailVerified ? 'password-reset-input--verified' : ''} ${socialProvider ? 'password-reset-input--error' : ''}`}
                placeholder="xblock@gmail.com"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onEmailChange(e.target.value)}
                disabled={isEmailVerified}
              />
              <button 
                className={`password-reset-inline-button ${isEmailVerified ? 'password-reset-inline-button--verified' : ''}`}
                onClick={onCheckEmail}
                disabled={isCheckingEmail || isEmailVerified}
              >
                {isCheckingEmail ? '확인 중...' : isEmailVerified ? '확인완료' : '확인'}
              </button>
            </div>
            {emailError && <p className="password-reset-error">{emailError}</p>}
            {socialProvider && (
              <p className="password-reset-social-message">
                {getSocialProviderMessage(socialProvider)}
              </p>
            )}
          </div>

          {!showCodeSection && (
            <button 
              className={`password-reset-action-button ${canSendCode ? 'password-reset-action-button--active' : ''}`}
              onClick={onSendCode}
              disabled={!canSendCode || isSendingCode}
            >
              {isSendingCode ? '발송 중...' : '이메일 인증하기'}
            </button>
          )}

          {showCodeSection && (
            <>
              <div className="password-reset-section">
                <label className="password-reset-label">이메일 인증코드</label>
                <div className="password-reset-input-row">
                  <input
                    type="text"
                    className={`password-reset-input ${isCodeVerified ? 'password-reset-input--verified' : ''}`}
                    placeholder="이메일 인증코드"
                    value={code}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onCodeChange(e.target.value)}
                    disabled={isCodeVerified}
                    maxLength={6}
                  />
                  {!isCodeVerified && (
                    <span className={`password-reset-timer ${timerSeconds === 0 ? 'password-reset-timer--expired' : ''}`}>
                      {timerFormatted}
                    </span>
                  )}
                  <button 
                    className={`password-reset-inline-button ${isCodeVerified ? 'password-reset-inline-button--verified' : ''}`}
                    onClick={onVerifyCode}
                    disabled={isVerifyingCode || isCodeVerified || timerSeconds === 0}
                  >
                    {isVerifyingCode ? '확인 중...' : isCodeVerified ? '인증완료' : '확인'}
                  </button>
                </div>
                {codeError && <p className="password-reset-error">{codeError}</p>}
                {!isCodeVerified && (
                  <p className="password-reset-resend">
                    인증코드를 받지 못하셨나요?{' '}
                    <button 
                      className="password-reset-resend-button"
                      onClick={onSendCode}
                      disabled={isSendingCode}
                    >
                      인증코드 재전송하기
                    </button>
                  </p>
                )}
              </div>
            </>
          )}

          {showPasswordSection && (
            <div className="password-reset-section">
              <label className="password-reset-label">새 비밀번호</label>
              <div className="password-reset-password-field">
                <PasswordInput
                  placeholder="새 비밀번호"
                  value={newPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => onNewPasswordChange(e.target.value)}
                />
              </div>
              <div className="password-reset-password-field">
                <PasswordInput
                  placeholder="새 비밀번호 확인"
                  value={confirmPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => onConfirmPasswordChange(e.target.value)}
                />
              </div>
              {passwordError && <p className="password-reset-error">{passwordError}</p>}
            </div>
          )}
        </div>
      </main>

      <footer className="password-reset-footer">
        <button 
          className={`password-reset-submit ${showPasswordSection && newPassword && confirmPassword ? 'password-reset-submit--active' : ''}`}
          onClick={onChangePassword}
          disabled={!showPasswordSection || !newPassword || !confirmPassword || isChangingPassword}
        >
          {isChangingPassword ? '변경 중...' : '비밀번호 재설정하기'}
        </button>
      </footer>
    </div>
  );
}
