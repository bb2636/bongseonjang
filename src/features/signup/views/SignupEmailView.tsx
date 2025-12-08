import { ChangeEvent } from "react";
import { AlertModal } from "@components";
import ReferralResultModal from "../../../components/ReferralResultModal";
import AgreementSection from "../components/AgreementSection";
import './SignupEmailView.css';

type CurrentStep = 'email' | 'password' | 'profile';

interface EmailStepProps {
  email: string;
  verificationCode: string;
  isCodeSent: boolean;
  isEmailVerified: boolean;
  isVerifying: boolean;
  isConfirming: boolean;
  isEmailValid: boolean;
  isCodeValid: boolean;
  errors: {
    email: string | null;
    verificationCode: string | null;
  };
  showSnackbar: boolean;
  showErrorModal: boolean;
  errorModalMessage: string;
  timer: string;
  isTimerActive: boolean;
  onEmailChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onEmailBlur: () => void;
  onCodeBlur: () => void;
  onVerifyEmail: () => void;
  onResendCode: () => void;
  onConfirmCode: () => void;
  onCloseErrorModal: () => void;
}

interface PasswordStepProps {
  email: string;
  password: string;
  passwordConfirm: string;
  showPassword: boolean;
  showPasswordConfirm: boolean;
  isPasswordValid: boolean;
  isPasswordConfirmValid: boolean;
  errors: {
    password: string | null;
    passwordConfirm: string | null;
  };
  onPasswordChange: (value: string) => void;
  onPasswordConfirmChange: (value: string) => void;
  onPasswordBlur: () => void;
  onPasswordConfirmBlur: () => void;
  onTogglePasswordVisibility: () => void;
  onTogglePasswordConfirmVisibility: () => void;
  onPasswordNext: () => void;
}

interface ProfileStepProps {
  email: string;
  name: string;
  phone: string;
  isPhoneVerified: boolean;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  gender: 'male' | 'female' | '';
  referralId: string;
  isReferralIdVerified: boolean;
  isOver14: boolean;
  termsAgreed: boolean;
  privacyAgreed: boolean;
  isLoading: boolean;
  isReferralVerifying: boolean;
  isNameValid: boolean;
  isPhoneValid: boolean;
  isBirthDateValid: boolean;
  isGenderValid: boolean;
  isReferralIdValid: boolean;
  isAgreementValid: boolean;
  isValid: boolean;
  errors: {
    name: string | null;
    phone: string | null;
    birthDate: string | null;
    gender: string | null;
    referralId: string | null;
  };
  showReferralModal: boolean;
  referralModalMessage: string;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onNameBlur: () => void;
  onPhoneBlur: () => void;
  onPhoneVerify: () => void;
  onBirthYearChange: (value: string) => void;
  onBirthMonthChange: (value: string) => void;
  onBirthDayChange: (value: string) => void;
  onBirthDateBlur: () => void;
  onGenderChange: (value: 'male' | 'female') => void;
  onReferralIdChange: (value: string) => void;
  onReferralIdBlur: () => void;
  onReferralIdVerify: () => void;
  onCloseReferralModal: () => void;
  onOver14Change: (value: boolean) => void;
  onTermsAgreedChange: (value: boolean) => void;
  onPrivacyAgreedChange: (value: boolean) => void;
  onAllAgreeChange: (value: boolean) => void;
  onTermsDetailClick: () => void;
  onPrivacyDetailClick: () => void;
  onSubmit: () => void;
}

interface SignupEmailViewProps {
  currentStep: CurrentStep;
  emailStep: EmailStepProps;
  passwordStep: PasswordStepProps;
  profileStep: ProfileStepProps;
  onBack: () => void;
}

export default function SignupEmailView({ 
  currentStep,
  emailStep,
  passwordStep,
  profileStep,
  onBack,
}: SignupEmailViewProps) {
  const getSubmitButtonClass = () => {
    if (currentStep === 'profile') {
      return `signup-submit-button ${profileStep.isValid ? 'signup-submit-button--active' : ''}`;
    }
    if (currentStep === 'password') {
      return `signup-submit-button ${passwordStep.isPasswordValid && passwordStep.isPasswordConfirmValid ? 'signup-submit-button--active' : ''}`;
    }
    return 'signup-submit-button';
  };

  return (
    <div className="signup-container">
      <AlertModal
        isOpen={emailStep.showErrorModal}
        title={emailStep.errorModalMessage}
        onConfirm={emailStep.onCloseErrorModal}
      />
      
      <ReferralResultModal
        isOpen={profileStep.showReferralModal}
        message={profileStep.referralModalMessage}
        onConfirm={profileStep.onCloseReferralModal}
      />

      {emailStep.showSnackbar && (
        <div className="signup-snackbar">
          <span className="signup-snackbar-text">작성하신 이메일로 인증코드를 보냈어요</span>
        </div>
      )}

      <header className="signup-header">
        <button className="signup-back-button" onClick={onBack} aria-label="뒤로가기">
          <span className="signup-back-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="#101112"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
        <h1 className="signup-header-title">이메일로 회원가입</h1>
        <div className="signup-header-spacer" />
      </header>

      <main className="signup-content">
        <div className="signup-form-section">
          {currentStep === 'profile' ? (
            <ProfileForm profileStep={profileStep} />
          ) : currentStep === 'password' ? (
            <PasswordForm passwordStep={passwordStep} />
          ) : (
            <EmailForm emailStep={emailStep} />
          )}
        </div>
      </main>

      <footer className="signup-footer">
        {currentStep === 'profile' ? (
          <button
            className={getSubmitButtonClass()}
            onClick={profileStep.onSubmit}
            disabled={!profileStep.isValid || profileStep.isLoading}
          >
            {profileStep.isLoading ? "처리 중..." : "다음"}
          </button>
        ) : currentStep === 'password' ? (
          <button
            className={getSubmitButtonClass()}
            onClick={passwordStep.onPasswordNext}
            disabled={!passwordStep.isPasswordValid || !passwordStep.isPasswordConfirmValid}
          >
            다음
          </button>
        ) : (
          <button
            className="signup-submit-button"
            disabled
          >
            다음
          </button>
        )}
      </footer>
    </div>
  );
}

function EmailForm({ emailStep }: { emailStep: EmailStepProps }) {
  const verifyButtonClass = `signup-verify-button ${emailStep.email.trim().length > 0 && !emailStep.isCodeSent ? 'signup-verify-button--active' : ''}`;
  const confirmButtonClass = `signup-confirm-button ${emailStep.verificationCode.length === 6 ? 'signup-confirm-button--active' : ''}`;

  return (
    <>
      <div className="signup-input-group">
        <div className="signup-text-field">
          <label className="signup-label">이메일</label>
          <div className={`signup-input-box ${emailStep.errors.email ? 'signup-input-box--error' : ''}`}>
            <input
              className="signup-input"
              type="email"
              placeholder="이메일"
              value={emailStep.email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                emailStep.onEmailChange(e.target.value)
              }
              onBlur={emailStep.onEmailBlur}
            />
            {emailStep.errors.email && (
              <span className="signup-error">{emailStep.errors.email}</span>
            )}
          </div>
        </div>
      </div>

      <button
        className={verifyButtonClass}
        onClick={emailStep.onVerifyEmail}
        disabled={
          emailStep.isVerifying ||
          !emailStep.email.trim() ||
          emailStep.isCodeSent
        }
      >
        {emailStep.isVerifying ? "인증 중..." : "이메일 인증하기"}
      </button>

      {emailStep.isCodeSent && (
        <div className="signup-verification-section">
          <div className="signup-text-field">
            <label className="signup-label">이메일 인증코드</label>
            <div className={`signup-code-input-box ${emailStep.errors.verificationCode ? 'signup-code-input-box--error' : ''}`}>
              <div className="signup-code-input-row">
                <input
                  className="signup-code-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="인증코드 6자리"
                  value={emailStep.verificationCode}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    emailStep.onCodeChange(
                      e.target.value.replace(/[^0-9]/g, ""),
                    )
                  }
                  onBlur={emailStep.onCodeBlur}
                  maxLength={6}
                />
                <span className="signup-timer-text">{emailStep.timer}</span>
                <button
                  className={confirmButtonClass}
                  onClick={emailStep.onConfirmCode}
                  disabled={
                    emailStep.isConfirming ||
                    emailStep.verificationCode.length !== 6
                  }
                >
                  {emailStep.isConfirming ? "확인 중" : "확인"}
                </button>
              </div>
              {emailStep.errors.verificationCode && (
                <span className="signup-error">
                  {emailStep.errors.verificationCode}
                </span>
              )}
            </div>
          </div>

          <div className="signup-resend-link">
            인증코드를 받지 못하셨나요?
            <button className="signup-resend-button" onClick={emailStep.onResendCode}>
              인증코드 재전송하기
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function PasswordForm({ passwordStep }: { passwordStep: PasswordStepProps }) {
  return (
    <>
      <div className="signup-verified-section">
        <div className="signup-text-field">
          <label className="signup-label">이메일</label>
          <div className="signup-verified-input-box">
            <span className="signup-verified-input-text">{passwordStep.email}</span>
          </div>
        </div>
        <div className="signup-verified-button">이메일 인증 완료</div>
      </div>

      <div className="signup-password-section">
        <div className="signup-text-field">
          <label className="signup-label">비밀번호</label>
          <div className={`signup-password-input-box ${passwordStep.errors.password ? 'signup-password-input-box--error' : ''}`}>
            <div className="signup-password-input-row">
              <input
                className="signup-password-input"
                type={passwordStep.showPassword ? "text" : "password"}
                placeholder="비밀번호"
                value={passwordStep.password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  passwordStep.onPasswordChange(e.target.value)
                }
                onBlur={passwordStep.onPasswordBlur}
              />
              <button
                className="signup-visibility-toggle"
                type="button"
                onClick={passwordStep.onTogglePasswordVisibility}
                aria-label={passwordStep.showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                {passwordStep.showPassword ? (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M11 4.5C6 4.5 2.73 7.61 1 11C2.73 14.39 6 17.5 11 17.5C16 17.5 19.27 14.39 21 11C19.27 7.61 16 4.5 11 4.5ZM11 15C8.79 15 7 13.21 7 11C7 8.79 8.79 7 11 7C13.21 7 15 8.79 15 11C15 13.21 13.21 15 11 15ZM11 9C9.9 9 9 9.9 9 11C9 12.1 9.9 13 11 13C12.1 13 13 12.1 13 11C13 9.9 12.1 9 11 9Z" fill="rgba(12, 12, 12, 0.4)"/>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M11 6C13.76 6 16 8.24 16 11C16 11.65 15.87 12.26 15.64 12.83L18.56 15.75C20.07 14.49 21.26 12.86 21.99 11C20.26 6.61 15.99 3.5 10.99 3.5C9.59 3.5 8.25 3.75 7.01 4.2L9.17 6.36C9.74 6.13 10.35 6 11 6ZM1 2.27L3.74 5.01C2.06 6.3 0.74 8.07 0 10.99C1.73 15.38 6 18.5 11 18.5C12.55 18.5 14.03 18.2 15.38 17.66L18.73 21L20 19.73L2.27 1L1 2.27ZM6.53 7.8L8.08 9.35C8.03 9.56 8 9.78 8 10C8 11.66 9.34 13 11 13C11.22 13 11.44 12.97 11.65 12.92L13.2 14.47C12.53 14.8 11.79 15 11 15C8.24 15 6 12.76 6 10C6 9.21 6.2 8.47 6.53 7.8ZM10.84 7.02L13.99 10.17L14.01 10.01C14.01 8.35 12.67 7.01 11.01 7.01L10.84 7.02Z" fill="rgba(12, 12, 12, 0.4)"/>
                  </svg>
                )}
              </button>
            </div>
            {passwordStep.errors.password && (
              <span className="signup-error">{passwordStep.errors.password}</span>
            )}
          </div>
        </div>

        <div className="signup-text-field">
          <label className="signup-label">비밀번호 확인</label>
          <div className={`signup-password-input-box ${passwordStep.errors.passwordConfirm ? 'signup-password-input-box--error' : ''}`}>
            <div className="signup-password-input-row">
              <input
                className="signup-password-input"
                type={passwordStep.showPasswordConfirm ? "text" : "password"}
                placeholder="비밀번호 확인"
                value={passwordStep.passwordConfirm}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  passwordStep.onPasswordConfirmChange(e.target.value)
                }
                onBlur={passwordStep.onPasswordConfirmBlur}
              />
              <button
                className="signup-visibility-toggle"
                type="button"
                onClick={passwordStep.onTogglePasswordConfirmVisibility}
                aria-label={passwordStep.showPasswordConfirm ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                {passwordStep.showPasswordConfirm ? (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M11 4.5C6 4.5 2.73 7.61 1 11C2.73 14.39 6 17.5 11 17.5C16 17.5 19.27 14.39 21 11C19.27 7.61 16 4.5 11 4.5ZM11 15C8.79 15 7 13.21 7 11C7 8.79 8.79 7 11 7C13.21 7 15 8.79 15 11C15 13.21 13.21 15 11 15ZM11 9C9.9 9 9 9.9 9 11C9 12.1 9.9 13 11 13C12.1 13 13 12.1 13 11C13 9.9 12.1 9 11 9Z" fill="rgba(12, 12, 12, 0.4)"/>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M11 6C13.76 6 16 8.24 16 11C16 11.65 15.87 12.26 15.64 12.83L18.56 15.75C20.07 14.49 21.26 12.86 21.99 11C20.26 6.61 15.99 3.5 10.99 3.5C9.59 3.5 8.25 3.75 7.01 4.2L9.17 6.36C9.74 6.13 10.35 6 11 6ZM1 2.27L3.74 5.01C2.06 6.3 0.74 8.07 0 10.99C1.73 15.38 6 18.5 11 18.5C12.55 18.5 14.03 18.2 15.38 17.66L18.73 21L20 19.73L2.27 1L1 2.27ZM6.53 7.8L8.08 9.35C8.03 9.56 8 9.78 8 10C8 11.66 9.34 13 11 13C11.22 13 11.44 12.97 11.65 12.92L13.2 14.47C12.53 14.8 11.79 15 11 15C8.24 15 6 12.76 6 10C6 9.21 6.2 8.47 6.53 7.8ZM10.84 7.02L13.99 10.17L14.01 10.01C14.01 8.35 12.67 7.01 11.01 7.01L10.84 7.02Z" fill="rgba(12, 12, 12, 0.4)"/>
                  </svg>
                )}
              </button>
            </div>
            {passwordStep.errors.passwordConfirm && (
              <span className="signup-error">{passwordStep.errors.passwordConfirm}</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ProfileForm({ profileStep }: { profileStep: ProfileStepProps }) {
  const getInputBoxClass = (hasError: boolean, hasSuccess?: boolean) => {
    let className = 'signup-verify-input-box-with-error';
    if (hasError) className += ' signup-verify-input-box-with-error--error';
    if (hasSuccess) className += ' signup-verify-input-box-with-error--success';
    return className;
  };

  return (
    <div className="signup-full-form">
      <div className="signup-text-field">
        <label className="signup-label">이메일</label>
        <div className="signup-readonly-input-box">
          <span className="signup-readonly-input-text">{profileStep.email}</span>
        </div>
      </div>

      <div className="signup-text-field">
        <label className="signup-label">성함</label>
        <div className={`signup-form-input-box ${profileStep.errors.name ? 'signup-form-input-box--error' : ''}`}>
          <div className="signup-form-input-row">
            <input
              className="signup-form-input"
              type="text"
              placeholder="성함"
              value={profileStep.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                profileStep.onNameChange(e.target.value)
              }
              onBlur={profileStep.onNameBlur}
            />
          </div>
          {profileStep.errors.name && (
            <span className="signup-error">{profileStep.errors.name}</span>
          )}
        </div>
      </div>

      <div className="signup-text-field">
        <label className="signup-label">휴대폰</label>
        <div className="signup-verify-input-row">
          <div className={getInputBoxClass(!!profileStep.errors.phone)}>
            <input
              className="signup-form-input"
              type="tel"
              placeholder="휴대폰 번호를 입력해주세요"
              value={profileStep.phone}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                profileStep.onPhoneChange(e.target.value)
              }
              onBlur={profileStep.onPhoneBlur}
              maxLength={11}
            />
            {profileStep.errors.phone && (
              <span className="signup-error">{profileStep.errors.phone}</span>
            )}
          </div>
          <button className="signup-black-verify-button" onClick={profileStep.onPhoneVerify}>인증</button>
        </div>
      </div>

      <div className="signup-text-field">
        <label className="signup-label">생년월일</label>
        <div className="signup-birth-date-container">
          <div className="signup-birth-date-row">
            <div className="signup-birth-date-input-box">
              <input
                className="signup-birth-date-input"
                type="text"
                inputMode="numeric"
                placeholder="YYYY"
                value={profileStep.birthYear}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  profileStep.onBirthYearChange(e.target.value)
                }
                onBlur={profileStep.onBirthDateBlur}
                maxLength={4}
              />
            </div>
            <span className="signup-birth-date-separator">.</span>
            <div className="signup-birth-date-input-box">
              <input
                className="signup-birth-date-input"
                type="text"
                inputMode="numeric"
                placeholder="MM"
                value={profileStep.birthMonth}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  profileStep.onBirthMonthChange(e.target.value)
                }
                onBlur={profileStep.onBirthDateBlur}
                maxLength={2}
              />
            </div>
            <span className="signup-birth-date-separator">.</span>
            <div className="signup-birth-date-input-box">
              <input
                className="signup-birth-date-input"
                type="text"
                inputMode="numeric"
                placeholder="DD"
                value={profileStep.birthDay}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  profileStep.onBirthDayChange(e.target.value)
                }
                onBlur={profileStep.onBirthDateBlur}
                maxLength={2}
              />
            </div>
          </div>
          {profileStep.errors.birthDate && (
            <span className="signup-error">{profileStep.errors.birthDate}</span>
          )}
        </div>
      </div>

      <div className="signup-text-field">
        <label className="signup-label">성별</label>
        <div className="signup-gender-container">
          <div className="signup-gender-row">
            <div
              className={`signup-gender-option ${profileStep.gender === 'male' ? 'signup-gender-option--selected' : ''}`}
              onClick={() => profileStep.onGenderChange('male')}
            >
              <div className={`signup-gender-radio ${profileStep.gender === 'male' ? 'signup-gender-radio--selected' : ''}`} />
              <span className="signup-gender-label">남성</span>
            </div>
            <div
              className={`signup-gender-option ${profileStep.gender === 'female' ? 'signup-gender-option--selected' : ''}`}
              onClick={() => profileStep.onGenderChange('female')}
            >
              <div className={`signup-gender-radio ${profileStep.gender === 'female' ? 'signup-gender-radio--selected' : ''}`} />
              <span className="signup-gender-label">여성</span>
            </div>
          </div>
          {profileStep.errors.gender && (
            <span className="signup-error">{profileStep.errors.gender}</span>
          )}
        </div>
      </div>

      <div className="signup-text-field">
        <label className="signup-label">추천인 아이디(선택)</label>
        <div className="signup-verify-input-row">
          <div className={getInputBoxClass(!!profileStep.errors.referralId, profileStep.isReferralIdVerified)}>
            <input
              className="signup-form-input"
              type="text"
              placeholder="최소 3자 이상 입력하세요"
              value={profileStep.referralId}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                profileStep.onReferralIdChange(e.target.value)
              }
              onBlur={profileStep.onReferralIdBlur}
            />
            {profileStep.errors.referralId && (
              <span className="signup-error">{profileStep.errors.referralId}</span>
            )}
          </div>
          <button 
            className="signup-black-verify-button"
            onClick={profileStep.onReferralIdVerify}
            disabled={profileStep.isReferralVerifying}
          >
            {profileStep.isReferralVerifying ? '확인 중...' : '아이디 확인'}
          </button>
        </div>
      </div>

      <AgreementSection
        isOver14={profileStep.isOver14}
        termsAgreed={profileStep.termsAgreed}
        privacyAgreed={profileStep.privacyAgreed}
        onOver14Change={profileStep.onOver14Change}
        onTermsAgreedChange={profileStep.onTermsAgreedChange}
        onPrivacyAgreedChange={profileStep.onPrivacyAgreedChange}
        onAllAgreeChange={profileStep.onAllAgreeChange}
        onTermsDetailClick={profileStep.onTermsDetailClick}
        onPrivacyDetailClick={profileStep.onPrivacyDetailClick}
      />
    </div>
  );
}
