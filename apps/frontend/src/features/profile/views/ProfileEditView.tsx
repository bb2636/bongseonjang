import { BottomNav } from '../../../components/BottomNav';
import { Input, PasswordInput, AlertModal } from '../../../components';
import './ProfileEditView.css';

interface ProfileEditViewProps {
  email: string;
  name: string;
  phone: string;
  newPassword: string;
  newPasswordConfirm: string;
  nameError: string | null;
  phoneError: string | null;
  passwordError: string | null;
  passwordConfirmError: string | null;
  isSubmitting: boolean;
  showSuccessModal: boolean;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onNewPasswordConfirmChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  onModalConfirm: () => void;
  onWithdrawClick: () => void;
}

export default function ProfileEditView({
  email,
  name,
  phone,
  newPassword,
  newPasswordConfirm,
  nameError,
  phoneError,
  passwordError,
  passwordConfirmError,
  isSubmitting,
  showSuccessModal,
  onNameChange,
  onPhoneChange,
  onNewPasswordChange,
  onNewPasswordConfirmChange,
  onSubmit,
  onBack,
  onModalConfirm,
  onWithdrawClick,
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
        <div className="profile-edit__header-right" />
      </header>

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
            label="성함"
            type="text"
            placeholder="성함을 입력해주세요"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            error={nameError}
          />

          <Input
            label="휴대폰 번호"
            type="tel"
            placeholder="휴대폰 번호를 입력해주세요"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            error={phoneError}
            maxLength={11}
          />

          <div className="profile-edit__password-section">
            <span className="profile-edit__section-title">비밀번호 변경</span>
            <div className="profile-edit__password-fields">
              <PasswordInput
                label="새 비밀번호"
                placeholder="새 비밀번호를 입력해주세요"
                value={newPassword}
                onChange={(e) => onNewPasswordChange(e.target.value)}
                error={passwordError}
              />
              <PasswordInput
                label="새 비밀번호 확인"
                placeholder="새 비밀번호를 다시 입력해주세요"
                value={newPasswordConfirm}
                onChange={(e) => onNewPasswordConfirmChange(e.target.value)}
                error={passwordConfirmError}
              />
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
        </form>
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

      <AlertModal
        isOpen={showSuccessModal}
        title="수정되었습니다."
        onConfirm={onModalConfirm}
      />

      <BottomNav />
    </div>
  );
}
