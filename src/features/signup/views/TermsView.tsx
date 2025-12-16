import './TermsView.css';
import type { TermsContent } from '../../terms/types/terms';

interface TermsViewProps {
  terms: {
    onBack: () => void;
    content: TermsContent | null;
    isLoading: boolean;
    error?: string;
  };
}

export default function TermsView({ terms }: TermsViewProps) {
  const renderContent = () => {
    if (terms.isLoading) {
      return <p className="terms-introduction">약관을 불러오는 중입니다...</p>;
    }

    if (terms.error) {
      return <p className="terms-introduction">{terms.error}</p>;
    }

    if (!terms.content) {
      return <p className="terms-introduction">등록된 약관이 없습니다.</p>;
    }

    const sections = terms.content.content.split(/\n\n+/);
    const updatedAt = new Date(terms.content.updatedAt);

    return (
      <>
        <div className="terms-updated">
          <span className="terms-updated-label">업데이트</span>
          <time dateTime={terms.content.updatedAt} className="terms-updated-value">
            {updatedAt.toLocaleString()}
          </time>
        </div>
        {sections.map((section, index) => (
          <p key={`${section}-${index}`} className="terms-introduction">
            {section}
          </p>
        ))}
      </>
    );
  };

  return (
    <div className="terms-container">
      <header className="terms-app-bar">
        <button className="terms-back-button" onClick={terms.onBack} aria-label="뒤로가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18L9 12L15 6" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="terms-title">약관보기</h1>
        <button className="terms-cart-button" type="button" aria-label="장바구니">
          <span className="terms-cart-icon" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M8 8.5L7 6H4" stroke="#0C0C0C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 11H17M10 14H17" stroke="#0C0C0C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6.5 8.5H19.5L18.5 19.5H7.5L6.5 8.5Z" stroke="#0C0C0C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 11V7C16 5.89543 15.1046 5 14 5H12C10.8954 5 10 5.89543 10 7V11" stroke="#0C0C0C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="terms-cart-badge" aria-label="장바구니에 1개의 상품이 있습니다.">1</span>
        </button>
      </header>

      <main className="terms-body">
        <section className="terms-selector" aria-label="서비스 이용약관 동의">
          <span className="terms-selector-label">서비스 이용약관 동의</span>
          <span className="terms-selector-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M6 8L10 12L14 8" stroke="#0C0C0C" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
        </section>

        <section className="terms-panel" aria-label="서비스 이용약관 전문">
          {renderContent()}
        </section>
      </main>
    </div>
  );
}
