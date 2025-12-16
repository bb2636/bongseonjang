import './AgreementSection.css';

interface AgreementSectionProps {
  isOver14: boolean;
  termsAgreed: boolean;
  privacyAgreed: boolean;
  onOver14Change: (value: boolean) => void;
  onTermsAgreedChange: (value: boolean) => void;
  onPrivacyAgreedChange: (value: boolean) => void;
  onAllAgreeChange: (value: boolean) => void;
  onTermsDetailClick: () => void;
  onPrivacyDetailClick: () => void;
}

function CheckedBox() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#3B9BD5"/>
      <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function UncheckedBox() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" stroke="rgba(12, 12, 12, 0.3)" strokeWidth="1"/>
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M6.75 13.5L11.25 9L6.75 4.5" stroke="#3B9BD5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function AgreementSection({
  isOver14,
  termsAgreed,
  privacyAgreed,
  onOver14Change,
  onTermsAgreedChange,
  onPrivacyAgreedChange,
  onAllAgreeChange,
  onTermsDetailClick,
  onPrivacyDetailClick,
}: AgreementSectionProps) {
  const allAgreed = isOver14 && termsAgreed && privacyAgreed;

  const handleAllAgreeClick = () => {
    onAllAgreeChange(!allAgreed);
  };

  const handleOver14Click = () => {
    onOver14Change(!isOver14);
  };

  const handleTermsClick = () => {
    onTermsAgreedChange(!termsAgreed);
  };

  const handlePrivacyClick = () => {
    onPrivacyAgreedChange(!privacyAgreed);
  };

  const handleTermsDetailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTermsDetailClick();
  };

  const handlePrivacyDetailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPrivacyDetailClick();
  };

  return (
    <div className="agreement-container">
      <div className="agreement-all-row" onClick={handleAllAgreeClick}>
        <div className="agreement-checkbox">
          {allAgreed ? <CheckedBox /> : <UncheckedBox />}
        </div>
        <span className="agreement-all-label">약관 전체동의</span>
      </div>

      <div className="agreement-items">
        <div className="agreement-item-row" onClick={handleOver14Click}>
          <div className="agreement-item-left">
            <div className="agreement-checkbox">
              {isOver14 ? <CheckedBox /> : <UncheckedBox />}
            </div>
            <div className="agreement-label-container">
              <span className="agreement-item-label">만 14세 이상입니다</span>
              <span className="agreement-required-badge">필수</span>
            </div>
          </div>
        </div>

        <div className="agreement-item-row" onClick={handleTermsClick}>
          <div className="agreement-item-left">
            <div className="agreement-checkbox">
              {termsAgreed ? <CheckedBox /> : <UncheckedBox />}
            </div>
            <div className="agreement-label-container">
              <span className="agreement-item-label">이용약관</span>
              <span className="agreement-required-badge">필수</span>
            </div>
          </div>
          <div className="agreement-arrow" onClick={handleTermsDetailClick}>
            <ArrowRight />
          </div>
        </div>

        <div className="agreement-item-row" onClick={handlePrivacyClick}>
          <div className="agreement-item-left">
            <div className="agreement-checkbox">
              {privacyAgreed ? <CheckedBox /> : <UncheckedBox />}
            </div>
            <div className="agreement-label-container">
              <span className="agreement-item-label">개인정보 처리방침</span>
              <span className="agreement-required-badge">필수</span>
            </div>
          </div>
          <div className="agreement-arrow" onClick={handlePrivacyDetailClick}>
            <ArrowRight />
          </div>
        </div>
      </div>
    </div>
  );
}
