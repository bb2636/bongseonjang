import { BottomNav } from '../../../components/BottomNav';
import { Input, AlertModal } from '../../../components';
import './ProfileEditView.css';

type PhoneVerificationMode = 'view' | 'input' | 'code';

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
  phoneVerificationMode: PhoneVerificationMode;
  verificationCode: string;
  verificationCodeError: string | null;
  timer: number;
  timerDisplay: string;
  isSendingCode: boolean;
  isVerifyingCode: boolean;
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
  onPhoneVerifyClick: () => void;
  onCancelPhoneVerification: () => void;
  onSendPhoneCode: () => void;
  onResendCode: () => void;
  onVerificationCodeChange: (value: string) => void;
  onVerifyCode: () => void;
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
  phoneVerificationMode,
  verificationCode,
  verificationCodeError,
  timerDisplay,
  isSendingCode,
  isVerifyingCode,
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
  onCancelPhoneVerification,
  onSendPhoneCode,
  onResendCode,
  onVerificationCodeChange,
  onVerifyCode,
}: ProfileEditViewProps) {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const renderPhoneButton = () => {
    if (phoneVerificationMode === 'view') {
      return (
        <button
          type="button"
          className="profile-edit__phone-verify-button"
          onClick={onPhoneVerifyClick}
        >
          다른 번호 인증
        </button>
      );
    }
    
    if (phoneVerificationMode === 'input') {
      return (
        <button
          type="button"
          className="profile-edit__phone-verify-button profile-edit__phone-verify-button--primary"
          onClick={onSendPhoneCode}
          disabled={isSendingCode}
        >
          {isSendingCode ? '발송중...' : '인증하기'}
        </button>
      );
    }
    
    return null;
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
        <form className="profile-edit__form" onSubmit={handleSubmit} noValidate>
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
              type="text"
              inputMode="numeric"
              placeholder="휴대폰 번호를 입력해주세요"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              error={phoneError}
              maxLength={11}
              readOnly={phoneVerificationMode === 'view' || phoneVerificationMode === 'code'}
            />
            {renderPhoneButton()}
          </div>

          {phoneVerificationMode === 'code' && (
            <div className="profile-edit__verification-code-section">
              <label className="profile-edit__section-label">휴대폰 인증코드</label>
              <div className={`profile-edit__verification-code-container ${verificationCodeError ? 'profile-edit__verification-code-container--error' : ''}`}>
                <input
                  type="text"
                  inputMode="numeric"
                  className="profile-edit__verification-code-input"
                  placeholder="인증코드 6자리"
                  value={verificationCode}
                  onChange={(e) => onVerificationCodeChange(e.target.value)}
                  maxLength={6}
                />
                <span className="profile-edit__verification-timer">{timerDisplay}</span>
                <button
                  type="button"
                  className="profile-edit__verification-confirm-button"
                  onClick={onVerifyCode}
                  disabled={isVerifyingCode}
                >
                  {isVerifyingCode ? '...' : '확인'}
                </button>
              </div>
              {verificationCodeError && (
                <p className="profile-edit__verification-error">{verificationCodeError}</p>
              )}
              <p className="profile-edit__verification-help">
                인증코드를 받지 못하셨나요?{' '}
                <button
                  type="button"
                  className="profile-edit__resend-link"
                  onClick={onResendCode}
                  disabled={isSendingCode}
                >
                  인증코드 재전송하기
                </button>
              </p>
              <button
                type="button"
                className="profile-edit__cancel-verification-link"
                onClick={onCancelPhoneVerification}
              >
                취소
              </button>
            </div>
          )}

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
