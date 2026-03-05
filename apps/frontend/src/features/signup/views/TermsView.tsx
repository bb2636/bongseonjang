import './TermsView.css';
import type { TermsContent } from '../../terms/types/terms';

interface TermsViewProps {
  state: {
    content: TermsContent | null;
    isLoading: boolean;
    error?: string;
  };
  actions: {
    onBack: () => void;
  };
}



export default function TermsView({ state, actions }: TermsViewProps) {
  const termsTitle = state.content?.title ?? '서비스 이용약관 동의';

  const renderContent = () => {
    if (state.isLoading) {
      return <p className="terms-introduction">약관을 불러오는 중입니다...</p>;
    }

    if (state.error) {
      return <p className="terms-introduction">{state.error}</p>;
    }

    if (!state.content) {
      return <p className="terms-introduction">등록된 약관이 없습니다.</p>;
    }

    const sections = state.content.content.split(/\n\n+/);
    const updatedAt = new Date(state.content.updatedAt);

    return (
      <>
        <h2 className="terms-list-title">{termsTitle}</h2>
        <div className="terms-updated">
          <span className="terms-updated-label">업데이트</span>
          <time dateTime={state.content.updatedAt} className="terms-updated-value">
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
        <button className="terms-back-button" onClick={actions.onBack} aria-label="뒤로가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18L9 12L15 6" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="terms-title">약관보기</h1>
        <div className="terms-header-placeholder" />
      </header>
      <div className="terms-header-spacer" />

      <main className="terms-body">
        <section className="terms-selector" aria-label={`${termsTitle} 선택`}>
          <span className="terms-selector-label">{termsTitle}</span>
          <span className="terms-selector-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M6 8L10 12L14 8" stroke="#0C0C0C" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
        </section>

        <section className="terms-panel" aria-label={`${termsTitle} 전문`}>
          {renderContent()}
        </section>
      </main>
    </div>
  );
}
