import './PrivacyView.css';

interface PrivacyViewProps {
  state: Record<string, never>;
  actions: {
    onBack: () => void;
  };
}

export default function PrivacyView({ actions }: PrivacyViewProps) {
  return (
    <div className="privacy-container">
      <header className="privacy-header">
        <button className="privacy-back-button" onClick={actions.onBack} aria-label="뒤로가기">
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
        <h1 className="privacy-header-title">개인정보 처리방침</h1>
        <div className="privacy-header-placeholder" />
      </header>
      <div className="privacy-header-spacer" />

      <div className="privacy-content">
        <div className="privacy-section">
          <h2 className="privacy-section-title">1. 개인정보 수집 항목</h2>
          <p className="privacy-section-content">
            회사는 회원가입, 서비스 이용 등을 위해 아래와 같은 개인정보를 수집합니다.{'\n'}
            - 필수항목: 이메일, 비밀번호, 이름, 휴대폰번호{'\n'}
            - 선택항목: 추천인 아이디
          </p>
        </div>

        <div className="privacy-section">
          <h2 className="privacy-section-title">2. 개인정보 수집 목적</h2>
          <p className="privacy-section-content">
            수집한 개인정보는 다음의 목적을 위해 활용됩니다.{'\n'}
            - 서비스 제공 및 운영{'\n'}
            - 회원 관리 및 본인 확인{'\n'}
            - 서비스 개선 및 신규 서비스 개발
          </p>
        </div>

        <div className="privacy-section">
          <h2 className="privacy-section-title">3. 개인정보 보유 기간</h2>
          <p className="privacy-section-content">
            회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관련 법령에 의하여 보존할 필요가 있는 경우 일정 기간 동안 보관합니다.
          </p>
        </div>

        <div className="privacy-section">
          <h2 className="privacy-section-title">4. 개인정보의 제3자 제공</h2>
          <p className="privacy-section-content">
            회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 이용자의 동의가 있거나 법령의 규정에 의한 경우는 예외로 합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
