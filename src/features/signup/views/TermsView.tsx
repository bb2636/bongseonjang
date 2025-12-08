import './TermsView.css';

interface TermsViewProps {
  terms: {
    onBack: () => void;
  };
}

export default function TermsView({ terms }: TermsViewProps) {
  return (
    <div className="terms-container">
      <header className="terms-header">
        <button className="terms-back-button" onClick={terms.onBack} aria-label="뒤로가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="#101112"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="terms-header-title">이용약관</h1>
      </header>

      <div className="terms-content">
        <div className="terms-section">
          <h2 className="terms-section-title">제1조 (목적)</h2>
          <p className="terms-section-content">
            본 약관은 봉선장(이하 "회사")이 제공하는 서비스의 이용 조건 및 절차, 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </div>

        <div className="terms-section">
          <h2 className="terms-section-title">제2조 (정의)</h2>
          <p className="terms-section-content">
            1. "서비스"란 회사가 제공하는 모든 온라인 서비스를 말합니다.{'\n'}
            2. "이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.{'\n'}
            3. "회원"이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 서비스를 이용할 수 있는 자를 말합니다.
          </p>
        </div>

        <div className="terms-section">
          <h2 className="terms-section-title">제3조 (약관의 효력 및 변경)</h2>
          <p className="terms-section-content">
            1. 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 공지함으로써 효력이 발생합니다.{'\n'}
            2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
