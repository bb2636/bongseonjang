import { BottomNav } from '../../../components/BottomNav';
import { Input, AlertModal } from '../../../components';
import './ProfileEditView.css';

interface ProfileEditViewProps {
  email: string;
  name: string;
  phone: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  gender: string | null;
  isMarketingEmail: boolean;
  isMarketingSms: boolean;
  nameError: string | null;
  phoneError: string | null;
  isSubmitting: boolean;
  showSuccessModal: boolean;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onBirthYearChange: (value: string) => void;
  onBirthMonthChange: (value: string) => void;
  onBirthDayChange: (value: string) => void;
  onGenderChange: (value: string | null) => void;
  onMarketingEmailChange: (value: boolean) => void;
  onMarketingSmsChange: (value: boolean) => void;
  onSubmit: () => void;
  onBack: () => void;
  onModalConfirm: () => void;
  onWithdrawClick: () => void;
  onPhoneVerifyClick?: () => void;
}

export default function ProfileEditView({
  email,
  name,
  phone,
  birthYear,
  birthMonth,
  birthDay,
  gender,
  isMarketingEmail,
  isMarketingSms,
  nameError,
  phoneError,
  isSubmitting,
  showSuccessModal,
  onNameChange,
  onPhoneChange,
  onBirthYearChange,
  onBirthMonthChange,
  onBirthDayChange,
  onGenderChange,
  onMarketingEmailChange,
  onMarketingSmsChange,
  onSubmit,
  onBack,
  onModalConfirm,
  onWithdrawClick,
  onPhoneVerifyClick,
}: ProfileEditViewProps) {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="profile-edit">
      <header className="profile-edit__header">
        <div className="profile-edit__header-left">
          <button
            type="button"
            className="profile-edit__back-button"
            onClick={onBack}
            aria-label="뒤로가기"
          >
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
        </div>
        <h1 className="profile-edit__title">프로필 수정</h1>
        <div className="profile-edit__header-placeholder" />
      </header>
      <div className="profile-edit__header-spacer" />

      <div className="profile-edit__content">
        <form className="profile-edit__form" onSubmit={handleSubmit}>
          <Input
            label="이메일"
            type="email"
            value={email}
            readOnly
            disabled
          />

          <Input
            label="이름"
            type="text"
            placeholder="이름을 입력해주세요"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            error={nameError}
          />

          <div className="profile-edit__phone-field">
            <Input
              label="휴대폰"
              type="tel"
              placeholder="휴대폰 번호를 입력해주세요"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              error={phoneError}
              maxLength={11}
            />
            <button
              type="button"
              className="profile-edit__phone-verify-button"
              onClick={onPhoneVerifyClick}
            >
              다른 번호 인증
            </button>
          </div>

          <div className="profile-edit__birth-section">
            <label className="profile-edit__section-label">생년월일</label>
            <div className="profile-edit__birth-inputs">
              <input
                type="text"
                className="profile-edit__birth-input profile-edit__birth-input--year"
                placeholder="00"
                value={birthYear}
                onChange={(e) => onBirthYearChange(e.target.value)}
                maxLength={4}
              />
              <span className="profile-edit__birth-separator">/</span>
              <input
                type="text"
                className="profile-edit__birth-input"
                placeholder="00"
                value={birthMonth}
                onChange={(e) => onBirthMonthChange(e.target.value)}
                maxLength={2}
              />
              <span className="profile-edit__birth-separator">/</span>
              <input
                type="text"
                className="profile-edit__birth-input"
                placeholder="00"
                value={birthDay}
                onChange={(e) => onBirthDayChange(e.target.value)}
                maxLength={2}
              />
            </div>
          </div>

          <div className="profile-edit__gender-section">
            <label className="profile-edit__section-label">성별</label>
            <div className="profile-edit__gender-options">
              <label className="profile-edit__radio-option">
                <input
                  type="radio"
                  name="gender"
                  checked={gender === 'male'}
                  onChange={() => onGenderChange('male')}
                />
                <span className="profile-edit__radio-custom" />
                <span className="profile-edit__radio-label">남자</span>
              </label>
              <label className="profile-edit__radio-option">
                <input
                  type="radio"
                  name="gender"
                  checked={gender === 'female'}
                  onChange={() => onGenderChange('female')}
                />
                <span className="profile-edit__radio-custom" />
                <span className="profile-edit__radio-label">여자</span>
              </label>
              <label className="profile-edit__radio-option">
                <input
                  type="radio"
                  name="gender"
                  checked={gender === null || gender === 'none'}
                  onChange={() => onGenderChange(null)}
                />
                <span className="profile-edit__radio-custom" />
                <span className="profile-edit__radio-label">선택안함</span>
              </label>
            </div>
          </div>

          <div className="profile-edit__marketing-section">
            <label className="profile-edit__section-label">약관 및 마케팅 수신 동의</label>
            <div className="profile-edit__marketing-options">
              <label className="profile-edit__checkbox-option">
                <input
                  type="checkbox"
                  checked={isMarketingEmail}
                  onChange={(e) => onMarketingEmailChange(e.target.checked)}
                />
                <span className="profile-edit__checkbox-custom">
                  {isMarketingEmail && (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1" stroke="#3B9BD5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                <span className="profile-edit__checkbox-label">마케팅 이메일 수신 <span className="profile-edit__checkbox-optional">선택</span></span>
              </label>
              <label className="profile-edit__checkbox-option">
                <input
                  type="checkbox"
                  checked={isMarketingSms}
                  onChange={(e) => onMarketingSmsChange(e.target.checked)}
                />
                <span className="profile-edit__checkbox-custom">
                  {isMarketingSms && (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1" stroke="#3B9BD5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                <span className="profile-edit__checkbox-label">마케팅 SMS 수신 <span className="profile-edit__checkbox-optional">선택</span></span>
              </label>
            </div>
          </div>

          <div className="profile-edit__withdraw-container">
            <button
              type="button"
              className="profile-edit__withdraw-button"
              onClick={onWithdrawClick}
            >
              <span className="profile-edit__withdraw-text">탈퇴하기</span>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M4.875 9.75L8.125 6.5L4.875 3.25"
                  stroke="#3B9BD5"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="profile-edit__submit-container">
            <button
              type="submit"
              className="profile-edit__submit-button"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>

      <AlertModal
        isOpen={showSuccessModal}
        title="수정되었습니다."
        onConfirm={onModalConfirm}
      />

      <BottomNav />
    </div>
  );
}
