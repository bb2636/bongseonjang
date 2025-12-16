import { AppBar } from '../../../components';
import type { InquiryWritePageState } from '../hooks/useInquiryWritePage';
import './InquiryWriteView.css';

interface InquiryWriteViewProps {
  state: InquiryWritePageState;
}

export default function InquiryWriteView({ state }: InquiryWriteViewProps) {
  const {
    inquiryType,
    question,
    isSubmitting,
    error,
    typeOptions,
    handleBack,
    handleTypeChange,
    handleQuestionChange,
    handleSubmit,
  } = state;

  return (
    <div className="inquiry-write-page">
      <AppBar
        title="문의하기"
        showBackButton
        onBackClick={handleBack}
      />

      <main className="inquiry-write-page__content">
        <div className="inquiry-write-page__form">
          <div className="inquiry-write-page__section">
            <label className="inquiry-write-page__label">문의 유형</label>
            <div className="inquiry-write-page__type-list">
              {typeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`inquiry-write-page__type-btn ${
                    inquiryType === option.value ? 'inquiry-write-page__type-btn--active' : ''
                  }`}
                  onClick={() => handleTypeChange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="inquiry-write-page__section">
            <label className="inquiry-write-page__label">문의 내용</label>
            <textarea
              className="inquiry-write-page__textarea"
              placeholder="문의하실 내용을 입력해주세요. (최소 10자 이상)"
              value={question}
              onChange={(e) => handleQuestionChange(e.target.value)}
              maxLength={1000}
            />
            <span className="inquiry-write-page__char-count">
              {question.length}/1000
            </span>
            {error && <span className="inquiry-write-page__error">{error}</span>}
          </div>

          <div className="inquiry-write-page__notice">
            <p className="inquiry-write-page__notice-title">안내사항</p>
            <ul className="inquiry-write-page__notice-list">
              <li className="inquiry-write-page__notice-item">
                문의 내용은 영업일 기준 1~2일 이내 답변됩니다.
              </li>
              <li className="inquiry-write-page__notice-item">
                주문/배송 관련 문의는 주문번호를 함께 기재해주세요.
              </li>
              <li className="inquiry-write-page__notice-item">
                욕설, 비방 등 부적절한 내용은 삭제될 수 있습니다.
              </li>
            </ul>
          </div>
        </div>
      </main>

      <div className="inquiry-write-page__footer">
        <button
          type="button"
          className="inquiry-write-page__submit-btn"
          onClick={handleSubmit}
          disabled={isSubmitting || question.trim().length < 10}
        >
          {isSubmitting ? '등록 중...' : '문의 등록'}
        </button>
      </div>
    </div>
  );
}
