import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLoginPage.css';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const validateEmail = (value: string): boolean => {
    if (!value.trim()) {
      setEmailError('꼭 입력해주세요.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('꼭 입력해주세요.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value: string): boolean => {
    if (!value.trim()) {
      setPasswordError('꼭 입력해주세요.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailTouched) {
      validateEmail(value);
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    validateEmail(email);
  };

  const handlePasswordChange = (value: string) => {
    const filtered = value.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, '');
    setPassword(filtered);
    if (passwordTouched) {
      validatePassword(filtered);
    }
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    validatePassword(password);
  };

  const isFormValid = email.trim() !== '' && password.trim() !== '' && !emailError && !passwordError;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    setEmailTouched(true);
    setPasswordTouched(true);
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid || isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '로그인에 실패했습니다');
      }

      sessionStorage.setItem('admin_token', data.token);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    if (token) {
      navigate('/admin');
    }
  }, [navigate]);

  return (
    <div className="admin-login">
      <div className="admin-login__container">
        <div className="admin-login__logo-section">
          <div className="admin-login__logo-box">
            <img 
              src="/logo.svg" 
              alt="봉선장" 
            />
          </div>
          <h1 className="admin-login__title">봉선장</h1>
        </div>

        <form className="admin-login__form" onSubmit={handleSubmit}>
          {error && <div className="admin-login__error">{error}</div>}
          
          <div className="admin-login__field">
            <label className="admin-login__label">이메일</label>
            <div className="admin-login__input-wrapper">
              <input
                type="email"
                className={`admin-login__input ${emailError && emailTouched ? 'admin-login__input--error' : ''}`}
                placeholder="이메일"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={handleEmailBlur}
                autoComplete="email"
              />
            </div>
            {emailError && emailTouched && (
              <span className="admin-login__field-error">{emailError}</span>
            )}
          </div>

          <div className="admin-login__field">
            <label className="admin-login__label">비밀번호</label>
            <div className="admin-login__input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`admin-login__input ${passwordError && passwordTouched ? 'admin-login__input--error' : ''}`}
                placeholder="비밀번호"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onBlur={handlePasswordBlur}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="admin-login__toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {passwordError && passwordTouched && (
              <span className="admin-login__field-error">{passwordError}</span>
            )}
          </div>

          <button
            type="submit"
            className="admin-login__submit"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
