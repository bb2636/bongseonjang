import { useEffect, useRef } from 'react';
import { AppBar } from '../../../components';
import { INQUIRY_TYPE_LABELS } from '../types/inquiry';
import type { InquiryListPageState } from '../hooks/useInquiryListPage';
import './InquiryListView.css';

interface InquiryListViewProps {
  state: InquiryListPageState;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export default function InquiryListView({ state }: InquiryListViewProps) {
  const {
    filteredInquiries,
    isLoading,
    error,
    selectedType,
    sortOrder,
    isTypeDropdownOpen,
    typeOptions,
    handleBack,
    handleCartClick,
    handleInquiryClick,
    handleTypeChange,
    handleSortChange,
    handleToggleTypeDropdown,
    handleCloseTypeDropdown,
  } = state;

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleCloseTypeDropdown();
      }
    }

    if (isTypeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTypeDropdownOpen, handleCloseTypeDropdown]);

  const selectedTypeLabel = typeOptions.find((opt) => opt.value === selectedType)?.label || '문의 유형 선택';

  return (
    <div className="inquiry-list-page">
      <AppBar
        title="1:1문의"
        showBackButton
        onBackClick={handleBack}
        showCart
        onCartClick={handleCartClick}
      />

      <main className="inquiry-list-page__content">
        <div className="inquiry-list-page__filter-bar">
          <div className="inquiry-list-page__type-dropdown" ref={dropdownRef}>
            <button
              type="button"
              className="inquiry-list-page__type-btn"
              onClick={handleToggleTypeDropdown}
            >
              <span className="inquiry-list-page__type-text">{selectedTypeLabel}</span>
              <svg
                className={`inquiry-list-page__type-arrow ${isTypeDropdownOpen ? 'inquiry-list-page__type-arrow--open' : ''}`}
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path d="M5 8L10 13L15 8" stroke="rgba(12, 12, 12, 0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {isTypeDropdownOpen && (
              <ul className="inquiry-list-page__type-menu">
                {typeOptions.map((option) => (
                  <li key={option.value}>
                    <button
                      type="button"
                      className={`inquiry-list-page__type-option ${selectedType === option.value ? 'inquiry-list-page__type-option--selected' : ''}`}
                      onClick={() => handleTypeChange(option.value)}
                    >
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="inquiry-list-page__sort-tabs">
            <button
              type="button"
              className={`inquiry-list-page__sort-tab ${sortOrder === 'newest' ? 'inquiry-list-page__sort-tab--active' : ''}`}
              onClick={() => handleSortChange('newest')}
            >
              최신순
            </button>
            <button
              type="button"
              className={`inquiry-list-page__sort-tab ${sortOrder === 'oldest' ? 'inquiry-list-page__sort-tab--active' : ''}`}
              onClick={() => handleSortChange('oldest')}
            >
              오래된 순
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="inquiry-list-page__loading">로딩 중...</div>
        ) : error ? (
          <div className="inquiry-list-page__error">{error}</div>
        ) : filteredInquiries.length === 0 ? (
          <div className="inquiry-list__empty">
            <svg className="inquiry-list__empty-icon" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" />
              <path d="M32 20V36M32 44H32.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="inquiry-list__empty-text">등록된 문의가 없습니다.</p>
          </div>
        ) : (
          <ul className="inquiry-list">
            {filteredInquiries.map((inquiry) => (
              <li key={inquiry.id} className="inquiry-list__item">
                <button
                  type="button"
                  className="inquiry-list__item-button"
                  onClick={() => handleInquiryClick(inquiry.id)}
                >
                  <div className="inquiry-list__item-header">
                    <div className="inquiry-list__item-meta">
                      <span
                        className={`inquiry-list__status ${
                          inquiry.isAnswered
                            ? 'inquiry-list__status--answered'
                            : 'inquiry-list__status--pending'
                        }`}
                      >
                        {inquiry.isAnswered ? '답변완료' : '미답변'}
                      </span>
                      <span className="inquiry-list__type">
                        {INQUIRY_TYPE_LABELS[inquiry.inquiryType]}
                      </span>
                    </div>
                    <span className="inquiry-list__date">{formatDate(inquiry.createdAt)}</span>
                  </div>

                  {inquiry.productName && (
                    <div className="inquiry-list__product-info">
                      <span className="inquiry-list__product-label">문의 상품</span>
                      <div className="inquiry-list__product-row">
                        <div className="inquiry-list__product-thumb">
                          {inquiry.productImageUrl ? (
                            <img src={inquiry.productImageUrl} alt="" />
                          ) : null}
                        </div>
                        <span className="inquiry-list__product-name">{inquiry.productName}</span>
                      </div>
                    </div>
                  )}

                  <div className="inquiry-list__question-row">
                    <span className="inquiry-list__question-icon">Q</span>
                    <p className="inquiry-list__question">{inquiry.question}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
