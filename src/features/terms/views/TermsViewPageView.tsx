import type { TermsViewPageState } from '../hooks/useTermsViewPage';
import type { TermsType } from '../types/terms';
import './TermsViewPageView.css';

interface TermsViewPageViewProps {
  state: TermsViewPageState;
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
  content: TermsViewPageState['content'];
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

export default function TermsViewPageView({ state }: TermsViewPageViewProps) {
  return (
    <div className="terms-view">
      <header className="terms-view__header">
        <button className="terms-view__back" onClick={state.onBack} aria-label="뒤로가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18L9 12L15 6" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="terms-view__title">약관보기</h1>
        <button className="terms-view__cart" type="button" aria-label="장바구니" onClick={state.onCartClick}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path 
              d="M6.5 7.58333V6.5C6.5 5.30653 6.97411 4.16193 7.81802 3.31802C8.66193 2.47411 9.80653 2 11 2H15C16.1935 2 17.3381 2.47411 18.182 3.31802C19.0259 4.16193 19.5 5.30653 19.5 6.5V7.58333M3.25 7.58333H22.75V21.6667C22.75 22.2413 22.5217 22.7924 22.1154 23.1987C21.7091 23.605 21.158 23.8333 20.5833 23.8333H5.41667C4.84203 23.8333 4.29093 23.605 3.88461 23.1987C3.47827 22.7924 3.25 22.2413 3.25 21.6667V7.58333Z" 
              stroke="rgba(12, 12, 12, 0.9)" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          {state.cartCount > 0 && (
            <span className="terms-view__cart-badge">{state.cartCount}</span>
          )}
        </button>
      </header>

      <main className="terms-view__body">
        <TermsDropdown
          options={state.options}
          selectedValue={state.selectedType}
          onChange={state.onTypeChange}
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
