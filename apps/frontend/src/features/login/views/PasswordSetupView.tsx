import { useState } from 'react';
import './PasswordSetupView.css';

interface PasswordSetupViewProps {
  onSubmit: (password: string) => Promise<void>;
  onSkip: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function PasswordSetupView({ onSubmit, onSkip, isLoading, error }: PasswordSetupViewProps) {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      return '비밀번호는 8자 이상이어야 합니다';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const pwdError = validatePassword(password);
    if (pwdError) {
      setValidationError(pwdError);
      return;
    }

    if (password !== passwordConfirm) {
      setValidationError('비밀번호가 일치하지 않습니다');
      return;
    }

    setValidationError(null);
    await onSubmit(password);
  };

  const isValid = password.length >= 8 && password === passwordConfirm;

  return (
    <div className="password-setup-container">
      <header className="password-setup-header">
        <button 
          className="password-setup-back-button" 
          onClick={onSkip}
          aria-label="건너뛰기"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="rgba(12, 12, 12, 0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </header>

      <main className="password-setup-content">
        <h1 className="password-setup-title">비밀번호 설정</h1>
        <p className="password-setup-subtitle">
          이메일 로그인을 위해 비밀번호를 설정해주세요.<br />
          나중에 설정하시려면 건너뛰기를 눌러주세요.
        </p>

        <form className="password-setup-form" onSubmit={handleSubmit}>
          <div className="password-setup-field">
            <label className="password-setup-label">비밀번호</label>
            <div className="password-setup-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="password-setup-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
              />
              <button
                type="button"
                className="password-setup-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M2.5 10C2.5 10 5 4.16667 10 4.16667C15 4.16667 17.5 10 17.5 10C17.5 10 15 15.8333 10 15.8333C5 15.8333 2.5 10 2.5 10Z" stroke="rgba(12,12,12,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="rgba(12,12,12,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M11.7666 11.7667C11.5378 12.0123 11.2617 12.2093 10.955 12.3459C10.6484 12.4826 10.3175 12.556 9.98199 12.5619C9.64649 12.5679 9.31319 12.5062 9.00192 12.3805C8.69064 12.2547 8.40782 12.0675 8.17046 11.8301C7.9331 11.5928 7.74589 11.31 7.62014 10.9987C7.4944 10.6874 7.43269 10.3541 7.43865 10.0186C7.4446 9.68312 7.51805 9.35225 7.65468 9.04558C7.79131 8.73891 7.98834 8.46283 8.23395 8.234" stroke="rgba(12,12,12,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14.9499 14.95C13.5254 16.0358 11.7908 16.6374 9.99992 16.6667C4.16659 16.6667 0.833252 10 0.833252 10C1.86984 8.06825 3.30753 6.38051 5.04992 5.05M8.24992 3.53333C8.82353 3.39907 9.41079 3.33195 9.99992 3.33333C15.8333 3.33333 19.1666 10 19.1666 10C18.6607 10.9463 18.0575 11.8373 17.3666 12.6583" stroke="rgba(12,12,12,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M0.833252 0.833336L19.1666 19.1667" stroke="rgba(12,12,12,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
            <p className="password-setup-hint">8자 이상 입력해주세요</p>
          </div>

          <div className="password-setup-field">
            <label className="password-setup-label">비밀번호 확인</label>
            <div className="password-setup-input-wrapper">
              <input
                type={showPasswordConfirm ? 'text' : 'password'}
                className="password-setup-input"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호 다시 입력"
              />
              <button
                type="button"
                className="password-setup-toggle"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                aria-label={showPasswordConfirm ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPasswordConfirm ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M2.5 10C2.5 10 5 4.16667 10 4.16667C15 4.16667 17.5 10 17.5 10C17.5 10 15 15.8333 10 15.8333C5 15.8333 2.5 10 2.5 10Z" stroke="rgba(12,12,12,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="rgba(12,12,12,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M11.7666 11.7667C11.5378 12.0123 11.2617 12.2093 10.955 12.3459C10.6484 12.4826 10.3175 12.556 9.98199 12.5619C9.64649 12.5679 9.31319 12.5062 9.00192 12.3805C8.69064 12.2547 8.40782 12.0675 8.17046 11.8301C7.9331 11.5928 7.74589 11.31 7.62014 10.9987C7.4944 10.6874 7.43269 10.3541 7.43865 10.0186C7.4446 9.68312 7.51805 9.35225 7.65468 9.04558C7.79131 8.73891 7.98834 8.46283 8.23395 8.234" stroke="rgba(12,12,12,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14.9499 14.95C13.5254 16.0358 11.7908 16.6374 9.99992 16.6667C4.16659 16.6667 0.833252 10 0.833252 10C1.86984 8.06825 3.30753 6.38051 5.04992 5.05M8.24992 3.53333C8.82353 3.39907 9.41079 3.33195 9.99992 3.33333C15.8333 3.33333 19.1666 10 19.1666 10C18.6607 10.9463 18.0575 11.8373 17.3666 12.6583" stroke="rgba(12,12,12,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M0.833252 0.833336L19.1666 19.1667" stroke="rgba(12,12,12,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {(validationError || error) && (
            <p className="password-setup-error">{validationError || error}</p>
          )}

          <button 
            type="submit" 
            className="password-setup-submit"
            disabled={!isValid || isLoading}
          >
            {isLoading ? '설정 중...' : '비밀번호 설정'}
          </button>
        </form>

        <button className="password-setup-skip" onClick={onSkip}>
          나중에 설정하기
        </button>
      </main>
    </div>
  );
}
