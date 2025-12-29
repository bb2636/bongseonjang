import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatformDetect } from '@/hooks/usePlatformDetect';
import { useAuth } from '@/contexts/AuthContext';
import './Footer.css';

export default function Footer() {
  const navigate = useNavigate();
  const { isWebBrowser } = usePlatformDetect();
  const { isAuthenticated } = useAuth();
  const [isBusinessInfoOpen, setIsBusinessInfoOpen] = useState(false);

  const toggleBusinessInfo = () => {
    setIsBusinessInfoOpen(!isBusinessInfoOpen);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleAppInstallClick = () => {
    window.open('https://play.google.com/store', '_blank');
  };

  return (
    <footer className="footer">
      <div className="footer__content">
        <button 
          className="footer__toggle" 
          onClick={toggleBusinessInfo}
          type="button"
        >
          <span className="footer__toggle-text">봉선장 사업자 정보</span>
          <svg 
            className={`footer__toggle-icon ${isBusinessInfoOpen ? 'footer__toggle-icon--open' : ''}`}
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none"
          >
            <path 
              d="M4 6L8 10L12 6" 
              stroke="rgba(12, 12, 12, 0.9)" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <nav className="footer__links">
          <button type="button" className="footer__link" onClick={() => navigate('/terms')}>이용약관</button>
          <button type="button" className="footer__link" onClick={() => navigate('/terms?type=PRIVACY_POLICY')}>개인정보처리방침</button>
          <button type="button" className="footer__link" onClick={() => navigate('/notice')}>공지사항</button>
          <button type="button" className="footer__link" onClick={() => navigate('/investment-info')}>투자정보</button>
        </nav>

        <div className="footer__info-container">
          {isBusinessInfoOpen && (
            <div className="footer__business-info">
              <p className="footer__copyright">Copyright © 봉선장. All rights reserved.</p>
              <div className="footer__details">
                <p className="footer__detail">대표자 : 이봉국</p>
                <p className="footer__detail">개인정보관리책임자 : 최승복</p>
                <p className="footer__detail">전화 : 1833-2282</p>
                <p className="footer__detail">이메일 : contact@captainbong.com</p>
                <p className="footer__detail">주소 : 전라북도 부안군 행안면 옥여길 76-15</p>
                <p className="footer__detail">통신판매업신고번호 : 2022-전북부안-0016</p>
                <p className="footer__detail">사업자등록번호 : 545-87-02220</p>
              </div>
            </div>
          )}

          <div className="footer__customer-service">
            <div className="footer__cs-info">
              <span className="footer__cs-title">고객센터</span>
              <span className="footer__cs-phone">1833-2282</span>
            </div>
            <p className="footer__cs-hours">평일 09:00~17:00 (점심시간 13:00~14:00)</p>
          </div>

          <div className="footer__buttons">
            {!isAuthenticated && (
              <button 
                type="button" 
                className="footer__button footer__button--primary"
                onClick={handleLoginClick}
              >
                로그인
              </button>
            )}
            {isWebBrowser && (
              <button 
                type="button" 
                className="footer__button footer__button--secondary"
                onClick={handleAppInstallClick}
              >
                앱 설치
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
