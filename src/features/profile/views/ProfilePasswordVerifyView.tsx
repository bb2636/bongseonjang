import { Input, PasswordInput } from '../../../components';
import './ProfilePasswordVerifyView.css';

interface ProfilePasswordVerifyViewProps {
  email: string;
  password: string;
  passwordError: string | null;
  isSubmitting: boolean;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export default function ProfilePasswordVerifyView({
  email,
  password,
  passwordError,
  isSubmitting,
  onPasswordChange,
  onSubmit,
  onBack,
}: ProfilePasswordVerifyViewProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const isValid = password.length > 0;

  return (
    <div className="profile-password-verify">
      <header className="profile-password-verify__header">
        <div className="profile-password-verify__header-left">
          <button
            type="button"
            className="profile-password-verify__back-button"
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
        <h1 className="profile-password-verify__title">프로필 수정</h1>
        <div className="profile-password-verify__header-right" />
      </header>

      <section className="profile-password-verify__info">
        <h2 className="profile-password-verify__info-title">비밀번호 재확인</h2>
        <p className="profile-password-verify__info-description">
          회원님의 정보를 안전하게 보호하기 위해 비밀번호를 다시 한 번 확인해주세요
        </p>
      </section>

      <form className="profile-password-verify__form" onSubmit={handleSubmit}>
        <Input
          label="이메일"
          type="email"
          value={email}
          readOnly
          disabled
        />
        <PasswordInput
          label="비밀번호"
          placeholder="비밀번호를 입력해주세요"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          error={passwordError}
          autoComplete="current-password"
        />
      </form>

      <div className="profile-password-verify__submit-container">
        <button
          type="submit"
          className="profile-password-verify__submit-button"
          disabled={!isValid || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? '확인 중...' : '확인'}
        </button>
      </div>
    </div>
  );
}
