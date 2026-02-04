import { useTermsViewPage } from '../hooks/useTermsViewPage';
import type { TermsType, TermsContent } from '../types/terms';
import './TermsViewPageView.css';

type TermsViewPageReturn = ReturnType<typeof useTermsViewPage>;

interface TermsViewPageViewProps {
  state: TermsViewPageReturn['state'];
  actions: TermsViewPageReturn['actions'];
}

function TermsDropdown({
  options,
  selectedValue,
  onChange,
}: {
  options: { value: TermsType; label: string }[];
  selectedValue: TermsType;
  onChange: (value: TermsType) => void;
}) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as TermsType);
  };

  return (
    <div className="terms-view__dropdown">
      <select
        className="terms-view__select"
        value={selectedValue}
        onChange={handleChange}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="terms-view__dropdown-icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M6 8L10 12L14 8" stroke="rgba(12, 12, 12, 0.5)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
    </div>
  );
}

function TermsContentPanel({
  content,
  isLoading,
  error,
}: {
  content: TermsContent | null;
  isLoading: boolean;
  error?: string;
}) {
  if (isLoading) {
    return (
      <div className="terms-view__panel">
        <p className="terms-view__text">약관을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="terms-view__panel">
        <p className="terms-view__text">{error}</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="terms-view__panel">
        <p className="terms-view__text">등록된 약관이 없습니다.</p>
      </div>
    );
  }

  const sections = content.content.split(/\n\n+/);

  return (
    <div className="terms-view__panel">
      {sections.map((section, index) => (
        <p key={`section-${index}`} className="terms-view__text">
          {section}
        </p>
      ))}
    </div>
  );
}

export default function TermsViewPageView({ state, actions }: TermsViewPageViewProps) {
  return (
    <div className="terms-view">
      <header className="terms-view__header">
        <button className="terms-view__back" onClick={actions.onBack} aria-label="뒤로가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18L9 12L15 6" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="terms-view__title">약관보기</h1>
        <div className="terms-view__header-placeholder" />
      </header>

      <main className="terms-view__body">
        <TermsDropdown
          options={state.options}
          selectedValue={state.selectedType}
          onChange={actions.onTypeChange}
        />

        <TermsContentPanel
          content={state.content}
          isLoading={state.isLoading}
          error={state.error}
        />
      </main>
    </div>
  );
}
