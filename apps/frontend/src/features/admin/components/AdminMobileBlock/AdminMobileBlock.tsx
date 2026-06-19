import './AdminMobileBlock.css';

export function AdminMobileBlock() {
  return (
    <div className="admin-mobile-block">
      <div className="admin-mobile-block__content">
        <span className="admin-mobile-block__icon" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="4" width="20" height="13" rx="2" stroke="#3B9BD5" strokeWidth="1.6" />
            <path d="M8 20h8" stroke="#3B9BD5" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M12 17v3" stroke="#3B9BD5" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
        <h1 className="admin-mobile-block__title">PC로 접속해주세요</h1>
        <p className="admin-mobile-block__description">
          관리자 페이지는 데스크톱 환경에 최적화되어 있습니다.
          <br />
          PC 또는 더 넓은 화면에서 다시 접속해주세요.
        </p>
      </div>
    </div>
  );
}
