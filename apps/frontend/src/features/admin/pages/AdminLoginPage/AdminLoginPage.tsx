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

      localStorage.setItem('token', data.token);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/admin');
    }
  }, [navigate]);

  return (
    <div className="admin-login">
      <div className="admin-login__background">
        <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
              <stop offset="100%" stopColor="rgba(200,225,240,0.4)" />
            </linearGradient>
            <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(180,210,230,0.5)" />
              <stop offset="100%" stopColor="rgba(160,200,225,0.3)" />
            </linearGradient>
            <linearGradient id="wave3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(220,235,245,0.5)" />
              <stop offset="100%" stopColor="rgba(200,225,240,0.3)" />
            </linearGradient>
          </defs>
          <path d="M-200,-50 Q100,150 400,50 T900,200 T1400,80 T1900,250 L2100,-100 Z" fill="url(#wave1)" />
          <path d="M-200,100 Q150,350 500,200 T1000,400 T1500,250 T2000,450 L2100,0 Z" fill="url(#wave2)" />
          <path d="M-200,350 Q200,550 550,400 T1100,600 T1600,450 T2100,650 L2100,200 Z" fill="url(#wave3)" />
          <path d="M-200,550 Q250,800 600,600 T1150,850 T1650,700 T2100,900 L2100,400 Z" fill="url(#wave1)" />
          <path d="M-200,750 Q300,1000 650,800 T1200,1050 T1700,880 T2100,1100 L2100,600 Z" fill="url(#wave2)" />
          <path d="M2100,150 Q1800,400 1400,200 T800,450 T300,250 T-200,500 L-200,0 L2100,-50 Z" fill="url(#wave3)" />
          <path d="M2100,400 Q1750,650 1350,450 T750,700 T250,500 T-200,750 L-200,250 L2100,200 Z" fill="url(#wave1)" />
          <path d="M2100,650 Q1700,900 1300,700 T700,950 T200,750 T-200,1000 L-200,500 L2100,450 Z" fill="url(#wave2)" />
          <path d="M2100,900 Q1650,1150 1250,950 T650,1200 T150,1000 T-200,1200 L-200,750 L2100,700 Z" fill="url(#wave3)" />
        </svg>
      </div>

      <div className="admin-login__container">
        <div className="admin-login__logo-section">
          <img 
            src="/logo.svg" 
            alt="봉선장" 
            className="admin-login__logo" 
          />
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
