import { ChangeEvent } from 'react';
import { AppBar } from '../../../components';
import { useFaqPage } from '../hooks/useFaqPage';
import './FaqPageView.css';

type FaqPageReturn = ReturnType<typeof useFaqPage>;

interface FaqPageViewProps {
  state: FaqPageReturn['state'];
  actions: FaqPageReturn['actions'];
}

export default function FaqPageView({ state, actions }: FaqPageViewProps) {
  const {
    categories,
    selectedCategoryId,
    searchQuery,
    filteredFaqs,
    expandedFaqId,
  } = state;
  const {
    handleBack,
    handleCartClick,
    handleCategorySelect,
    handleSearchChange,
    handleToggle,
  } = actions;

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleSearchChange(event.target.value);
  };

  return (
    <div className="faq-page">
      <AppBar
        title="FAQ"
        showBackButton
        onBackClick={handleBack}
        showCart
        onCartClick={handleCartClick}
      />

      <main className="faq-page__content">
        <section className="faq-search">
          <div className="faq-search__wrapper">
            <div className="faq-search__input-group">
              <span className="faq-search__icon" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M11 4C7.13401 4 4 7.13401 4 11C4 14.866 7.13401 18 11 18C12.857 18 14.5546 17.2856 15.7782 16.1058L19.2929 19.6206C19.6834 20.0111 20.3166 20.0111 20.7071 19.6206C21.0976 19.2301 21.0976 18.5969 20.7071 18.2064L17.1923 14.6916C18.3721 13.4681 19.0865 11.7704 19.0865 9.91348C19.0865 6.04749 15.9525 2.91348 12.0865 2.91348C8.22051 2.91348 5.0865 6.04749 5.0865 9.91348C5.0865 13.7795 8.22051 16.9135 12.0865 16.9135"
                    stroke="rgba(12, 12, 12, 0.5)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <input
                type="text"
                className="faq-search__input"
                placeholder="검색어를 입력해주세요"
                value={searchQuery}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className="faq-search__clear"
                aria-label="검색어 지우기"
                onClick={() => handleSearchChange('')}
                disabled={!searchQuery}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="rgba(12, 12, 12, 0.06)" />
                  <path
                    d="M9 9L15 15M15 9L9 15"
                    stroke="rgba(12, 12, 12, 0.5)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </section>

        <section className="faq-categories">
          <div className="faq-categories__grid">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`faq-categories__button ${selectedCategoryId === category.id ? 'is-active' : ''}`}
                onClick={() => handleCategorySelect(category.id)}
              >
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="faq-list" aria-label="자주 묻는 질문">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedFaqId === faq.id;
            return (
              <article key={faq.id} className={`faq-item ${isExpanded ? 'is-expanded' : ''}`}>
                <button
                  type="button"
                  className="faq-item__header"
                  onClick={() => handleToggle(faq.id)}
                  aria-expanded={isExpanded}
                >
                  <span className="faq-item__question">{faq.question}</span>
                  <span className={`faq-item__icon ${isExpanded ? 'is-open' : ''}`} aria-hidden>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M6 9L12 15L18 9"
                        stroke="rgba(12, 12, 12, 0.8)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
                {isExpanded && (
                  <div className="faq-item__body">
                    <p className="faq-item__answer">{faq.answer}</p>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      </main>

      <button type="button" className="faq-chat-button" aria-label="채팅 상담 열기">
        <span className="faq-chat-button__icon" aria-hidden>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="6" fill="white" />
            <path
              d="M7.5 9C7.5 7.89543 8.39543 7 9.5 7H18.5C19.6046 7 20.5 7.89543 20.5 9V15C20.5 16.1046 19.6046 17 18.5 17H11.75L8.5 20.25V15C8.5 14.4477 8.05228 14 7.5 14V9Z"
              fill="#0579CA"
            />
          </svg>
        </span>
      </button>
    </div>
  );
}
