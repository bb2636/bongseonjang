import { ChangeEvent } from 'react';
import { PasswordInput } from '@components';
import './PasswordResetConfirmView.css';

interface PasswordResetConfirmViewProps {
  newPassword: string;
  confirmPassword: string;
  errors: {
    newPassword: string | null;
    confirmPassword: string | null;
  };
  isLoading: boolean;
  hasToken: boolean;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onNewPasswordBlur: () => void;
  onConfirmPasswordBlur: () => void;
  onSubmit: () => void;
  onBack: () => void;
}

export default function PasswordResetConfirmView({
  newPassword,
  confirmPassword,
  errors,
  isLoading,
  hasToken,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onNewPasswordBlur,
  onConfirmPasswordBlur,
  onSubmit,
  onBack,
}: PasswordResetConfirmViewProps) {
  if (!hasToken) {
    return (
      <div className="password-reset-confirm-container">
        <header className="password-reset-confirm-header">
          <button className="password-reset-confirm-back-button" onClick={onBack} aria-label="뒤로가기">
            <span className="password-reset-confirm-back-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
          <h1 className="password-reset-confirm-header-title">새 비밀번호 설정</h1>
          <div className="password-reset-confirm-header-spacer" />
        </header>

        <main className="password-reset-confirm-content">
          <div className="password-reset-confirm-error-state">
            <p className="password-reset-confirm-error-message">
              유효하지 않은 링크입니다.<br />
              비밀번호 찾기를 다시 시도해주세요.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="password-reset-confirm-container">
      <header className="password-reset-confirm-header">
        <button className="password-reset-confirm-back-button" onClick={onBack} aria-label="뒤로가기">
          <span className="password-reset-confirm-back-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </button>
        <h1 className="password-reset-confirm-header-title">새 비밀번호 설정</h1>
        <div className="password-reset-confirm-header-spacer" />
      </header>

      <main className="password-reset-confirm-content">
        <div className="password-reset-confirm-form">
          <div className="password-reset-confirm-input-group">
            <PasswordInput
              label="새 비밀번호"
              placeholder="새 비밀번호"
              value={newPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onNewPasswordChange(e.target.value)}
              onBlur={onNewPasswordBlur}
              error={errors.newPassword}
            />

            <PasswordInput
              label="비밀번호 확인"
              placeholder="비밀번호 확인"
              value={confirmPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onConfirmPasswordChange(e.target.value)}
              onBlur={onConfirmPasswordBlur}
              error={errors.confirmPassword}
            />
          </div>

          <button 
            className="password-reset-confirm-submit"
            onClick={onSubmit}
            disabled={isLoading}
          >
            {isLoading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </div>
      </main>
    </div>
  );
}
