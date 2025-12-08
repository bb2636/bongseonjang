import { ChangeEvent } from "react";
import styled, { keyframes } from "styled-components";
import { AlertModal } from "@components";
import ReferralResultModal from "../../../components/ReferralResultModal";
import AgreementSection from "../components/AgreementSection";

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
  return (
    <Container>
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
        <Snackbar>
          <SnackbarText>작성하신 이메일로 인증코드를 보냈어요</SnackbarText>
        </Snackbar>
      )}

      <Header>
        <BackButton onClick={onBack} aria-label="뒤로가기">
          <BackIcon>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="#101112"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </BackIcon>
        </BackButton>
        <HeaderTitle>이메일로 회원가입</HeaderTitle>
        <HeaderSpacer />
      </Header>

      <Content>
        <FormSection>
          {currentStep === 'profile' ? (
            <ProfileForm profileStep={profileStep} />
          ) : currentStep === 'password' ? (
            <PasswordForm passwordStep={passwordStep} />
          ) : (
            <EmailForm emailStep={emailStep} />
          )}
        </FormSection>
      </Content>

      <Footer>
        {currentStep === 'profile' ? (
          <SubmitButton
            onClick={profileStep.onSubmit}
            disabled={!profileStep.isValid || profileStep.isLoading}
            $isActive={profileStep.isValid}
          >
            {profileStep.isLoading ? "처리 중..." : "다음"}
          </SubmitButton>
        ) : currentStep === 'password' ? (
          <SubmitButton
            onClick={passwordStep.onPasswordNext}
            disabled={!passwordStep.isPasswordValid || !passwordStep.isPasswordConfirmValid}
            $isActive={passwordStep.isPasswordValid && passwordStep.isPasswordConfirmValid}
          >
            다음
          </SubmitButton>
        ) : (
          <SubmitButton
            disabled
            $isActive={false}
          >
            다음
          </SubmitButton>
        )}
      </Footer>
    </Container>
  );
}

function EmailForm({ emailStep }: { emailStep: EmailStepProps }) {
  return (
    <>
      <InputGroup>
        <TextField>
          <Label>이메일</Label>
          <InputBox $hasError={!!emailStep.errors.email}>
            <Input
              type="email"
              placeholder="이메일"
              value={emailStep.email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                emailStep.onEmailChange(e.target.value)
              }
              onBlur={emailStep.onEmailBlur}
            />
            {emailStep.errors.email && (
              <ErrorMessage>{emailStep.errors.email}</ErrorMessage>
            )}
          </InputBox>
        </TextField>
      </InputGroup>

      <VerifyButton
        onClick={emailStep.onVerifyEmail}
        disabled={
          emailStep.isVerifying ||
          !emailStep.email.trim() ||
          emailStep.isCodeSent
        }
        $isActive={
          emailStep.email.trim().length > 0 && !emailStep.isCodeSent
        }
      >
        {emailStep.isVerifying ? "인증 중..." : "이메일 인증하기"}
      </VerifyButton>

      {emailStep.isCodeSent && (
        <VerificationSection>
          <TextField>
            <Label>이메일 인증코드</Label>
            <CodeInputBox $hasError={!!emailStep.errors.verificationCode}>
              <CodeInputRow>
                <CodeInput
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
                <TimerText>{emailStep.timer}</TimerText>
                <ConfirmButton
                  onClick={emailStep.onConfirmCode}
                  disabled={
                    emailStep.isConfirming ||
                    emailStep.verificationCode.length !== 6
                  }
                  $isActive={emailStep.verificationCode.length === 6}
                >
                  {emailStep.isConfirming ? "확인 중" : "확인"}
                </ConfirmButton>
              </CodeInputRow>
              {emailStep.errors.verificationCode && (
                <ErrorMessage>
                  {emailStep.errors.verificationCode}
                </ErrorMessage>
              )}
            </CodeInputBox>
          </TextField>

          <ResendLink>
            인증코드를 받지 못하셨나요?
            <ResendButton onClick={emailStep.onResendCode}>
              인증코드 재전송하기
            </ResendButton>
          </ResendLink>
        </VerificationSection>
      )}
    </>
  );
}

function PasswordForm({ passwordStep }: { passwordStep: PasswordStepProps }) {
  return (
    <>
      <VerifiedEmailSection>
        <TextField>
          <Label>이메일</Label>
          <VerifiedInputBox>
            <VerifiedInputText>{passwordStep.email}</VerifiedInputText>
          </VerifiedInputBox>
        </TextField>
        <VerifiedButton>이메일 인증 완료</VerifiedButton>
      </VerifiedEmailSection>

      <PasswordSection>
        <TextField>
          <Label>비밀번호</Label>
          <PasswordInputBox $hasError={!!passwordStep.errors.password}>
            <PasswordInputRow>
              <PasswordInput
                type={passwordStep.showPassword ? "text" : "password"}
                placeholder="비밀번호"
                value={passwordStep.password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  passwordStep.onPasswordChange(e.target.value)
                }
                onBlur={passwordStep.onPasswordBlur}
              />
              <VisibilityToggle
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
              </VisibilityToggle>
            </PasswordInputRow>
            {passwordStep.errors.password && (
              <ErrorMessage>{passwordStep.errors.password}</ErrorMessage>
            )}
          </PasswordInputBox>
        </TextField>

        <TextField>
          <Label>비밀번호 확인</Label>
          <PasswordInputBox $hasError={!!passwordStep.errors.passwordConfirm}>
            <PasswordInputRow>
              <PasswordInput
                type={passwordStep.showPasswordConfirm ? "text" : "password"}
                placeholder="비밀번호 확인"
                value={passwordStep.passwordConfirm}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  passwordStep.onPasswordConfirmChange(e.target.value)
                }
                onBlur={passwordStep.onPasswordConfirmBlur}
              />
              <VisibilityToggle
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
              </VisibilityToggle>
            </PasswordInputRow>
            {passwordStep.errors.passwordConfirm && (
              <ErrorMessage>{passwordStep.errors.passwordConfirm}</ErrorMessage>
            )}
          </PasswordInputBox>
        </TextField>
      </PasswordSection>
    </>
  );
}

function ProfileForm({ profileStep }: { profileStep: ProfileStepProps }) {
  return (
    <FullSignupForm>
      <TextField>
        <Label>이메일</Label>
        <ReadonlyInputBox>
          <ReadonlyInputText>{profileStep.email}</ReadonlyInputText>
        </ReadonlyInputBox>
      </TextField>

      <TextField>
        <Label>성함</Label>
        <FormInputBox $hasError={!!profileStep.errors.name}>
          <FormInputRow>
            <FormInput
              type="text"
              placeholder="성함"
              value={profileStep.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                profileStep.onNameChange(e.target.value)
              }
              onBlur={profileStep.onNameBlur}
            />
          </FormInputRow>
          {profileStep.errors.name && (
            <ErrorMessage>{profileStep.errors.name}</ErrorMessage>
          )}
        </FormInputBox>
      </TextField>

      <TextField>
        <Label>휴대폰</Label>
        <VerifyInputRow>
          <VerifyInputBoxWithError $hasError={!!profileStep.errors.phone}>
            <FormInput
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
              <ErrorMessage>{profileStep.errors.phone}</ErrorMessage>
            )}
          </VerifyInputBoxWithError>
          <BlackVerifyButton onClick={profileStep.onPhoneVerify}>인증</BlackVerifyButton>
        </VerifyInputRow>
      </TextField>

      <TextField>
        <Label>생년월일</Label>
        <BirthDateContainer $hasError={!!profileStep.errors.birthDate}>
          <BirthDateRow>
            <BirthDateInputBox>
              <BirthDateInput
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
            </BirthDateInputBox>
            <BirthDateSeparator>.</BirthDateSeparator>
            <BirthDateInputBox>
              <BirthDateInput
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
            </BirthDateInputBox>
            <BirthDateSeparator>.</BirthDateSeparator>
            <BirthDateInputBox>
              <BirthDateInput
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
            </BirthDateInputBox>
          </BirthDateRow>
          {profileStep.errors.birthDate && (
            <ErrorMessage>{profileStep.errors.birthDate}</ErrorMessage>
          )}
        </BirthDateContainer>
      </TextField>

      <TextField>
        <Label>성별</Label>
        <GenderContainer $hasError={!!profileStep.errors.gender}>
          <GenderRow>
            <GenderOption
              $isSelected={profileStep.gender === 'male'}
              onClick={() => profileStep.onGenderChange('male')}
            >
              <GenderRadio $isSelected={profileStep.gender === 'male'} />
              <GenderLabel>남성</GenderLabel>
            </GenderOption>
            <GenderOption
              $isSelected={profileStep.gender === 'female'}
              onClick={() => profileStep.onGenderChange('female')}
            >
              <GenderRadio $isSelected={profileStep.gender === 'female'} />
              <GenderLabel>여성</GenderLabel>
            </GenderOption>
          </GenderRow>
          {profileStep.errors.gender && (
            <ErrorMessage>{profileStep.errors.gender}</ErrorMessage>
          )}
        </GenderContainer>
      </TextField>

      <TextField>
        <Label>추천인 아이디(선택)</Label>
        <VerifyInputRow>
          <VerifyInputBoxWithError 
            $hasError={!!profileStep.errors.referralId}
            $hasSuccess={profileStep.isReferralIdVerified}
          >
            <FormInput
              type="text"
              placeholder="최소 3자 이상 입력하세요"
              value={profileStep.referralId}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                profileStep.onReferralIdChange(e.target.value)
              }
              onBlur={profileStep.onReferralIdBlur}
            />
            {profileStep.errors.referralId && (
              <ErrorMessage>{profileStep.errors.referralId}</ErrorMessage>
            )}
          </VerifyInputBoxWithError>
          <BlackVerifyButton 
            onClick={profileStep.onReferralIdVerify}
            disabled={profileStep.isReferralVerifying}
          >
            {profileStep.isReferralVerifying ? '확인 중...' : '아이디 확인'}
          </BlackVerifyButton>
        </VerifyInputRow>
      </TextField>

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
    </FullSignupForm>
  );
}

const slideUp = keyframes`
  from {
    transform: translateX(-50%) translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #ffffff;
  font-family: var(--font-family-base);
  position: relative;
`;

const Snackbar = styled.div`
  position: fixed;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 12px;
  width: 343px;
  max-width: calc(100% - 32px);
  height: 52px;
  background-color: rgba(12, 12, 12, 0.7);
  border-radius: 12px;
  animation: ${slideUp} 0.3s ease-out;
`;

const SnackbarText = styled.span`
  color: #ffffff;
  font-size: 14px;
  font-weight: 400;
  line-height: 24px;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  height: 56px;
  background: #ffffff;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
`;

const BackIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HeaderTitle = styled.h1`
  font-size: 16px;
  font-weight: 600;
  color: #101112;
  margin: 0;
`;

const HeaderSpacer = styled.div`
  width: 40px;
`;

const Content = styled.main`
  flex: 1;
  padding: 24px 16px;
  overflow-y: auto;
  padding-bottom: 100px;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TextField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #101112;
`;

const InputBox = styled.div<{ $hasError?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  background: #f5f5f5;
  border-radius: 12px;
  border: 1px solid ${props => props.$hasError ? '#ff4444' : 'transparent'};
`;

const Input = styled.input`
  width: 100%;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #101112;
  outline: none;
  
  &::placeholder {
    color: rgba(16, 17, 18, 0.4);
  }
`;

const ErrorMessage = styled.span`
  font-size: 12px;
  color: #ff4444;
  margin-top: 4px;
`;

const VerifyButton = styled.button<{ $isActive?: boolean }>`
  width: 100%;
  padding: 16px;
  background: ${props => props.$isActive ? '#3B9BD5' : '#e5e5e5'};
  color: ${props => props.$isActive ? '#ffffff' : 'rgba(16, 17, 18, 0.4)'};
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.$isActive ? 'pointer' : 'not-allowed'};
  transition: background 0.2s, color 0.2s;
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const VerificationSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CodeInputBox = styled.div<{ $hasError?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  background: #f5f5f5;
  border-radius: 12px;
  border: 1px solid ${props => props.$hasError ? '#ff4444' : 'transparent'};
`;

const CodeInputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CodeInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #101112;
  outline: none;
  
  &::placeholder {
    color: rgba(16, 17, 18, 0.4);
  }
`;

const TimerText = styled.span`
  font-size: 14px;
  color: #3B9BD5;
  font-weight: 500;
`;

const ConfirmButton = styled.button<{ $isActive?: boolean }>`
  padding: 8px 16px;
  background: ${props => props.$isActive ? '#101112' : '#e5e5e5'};
  color: ${props => props.$isActive ? '#ffffff' : 'rgba(16, 17, 18, 0.4)'};
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: ${props => props.$isActive ? 'pointer' : 'not-allowed'};
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const ResendLink = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 14px;
  color: rgba(16, 17, 18, 0.6);
`;

const ResendButton = styled.button`
  background: transparent;
  border: none;
  color: #3B9BD5;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
`;

const VerifiedEmailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const VerifiedInputBox = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: #f5f5f5;
  border-radius: 12px;
`;

const VerifiedInputText = styled.span`
  font-size: 16px;
  color: #101112;
`;

const VerifiedButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  background: #e8f4fc;
  border-radius: 8px;
  color: #3B9BD5;
  font-size: 14px;
  font-weight: 500;
`;

const PasswordSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
`;

const PasswordInputBox = styled.div<{ $hasError?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  background: #f5f5f5;
  border-radius: 12px;
  border: 1px solid ${props => props.$hasError ? '#ff4444' : 'transparent'};
`;

const PasswordInputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PasswordInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #101112;
  outline: none;
  
  &::placeholder {
    color: rgba(16, 17, 18, 0.4);
  }
`;

const VisibilityToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
`;

const FullSignupForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ReadonlyInputBox = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: #f5f5f5;
  border-radius: 12px;
`;

const ReadonlyInputText = styled.span`
  font-size: 16px;
  color: rgba(16, 17, 18, 0.6);
`;

const FormInputBox = styled.div<{ $hasError?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  background: #f5f5f5;
  border-radius: 12px;
  border: 1px solid ${props => props.$hasError ? '#ff4444' : 'transparent'};
`;

const FormInputRow = styled.div`
  display: flex;
  align-items: center;
`;

const FormInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #101112;
  outline: none;
  
  &::placeholder {
    color: rgba(16, 17, 18, 0.4);
  }
`;

const VerifyInputRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

const VerifyInputBoxWithError = styled.div<{ $hasError?: boolean; $hasSuccess?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  background: #f5f5f5;
  border-radius: 12px;
  border: 1px solid ${props => {
    if (props.$hasError) return '#ff4444';
    if (props.$hasSuccess) return '#3B9BD5';
    return 'transparent';
  }};
`;

const BlackVerifyButton = styled.button`
  padding: 14px 20px;
  background: #101112;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  
  &:disabled {
    background: #e5e5e5;
    color: rgba(16, 17, 18, 0.4);
    cursor: not-allowed;
  }
`;

const BirthDateContainer = styled.div<{ $hasError?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BirthDateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BirthDateInputBox = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: #f5f5f5;
  border-radius: 12px;
`;

const BirthDateInput = styled.input`
  width: 100%;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #101112;
  outline: none;
  text-align: center;
  
  &::placeholder {
    color: rgba(16, 17, 18, 0.4);
  }
`;

const BirthDateSeparator = styled.span`
  font-size: 16px;
  color: rgba(16, 17, 18, 0.4);
`;

const GenderContainer = styled.div<{ $hasError?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const GenderRow = styled.div`
  display: flex;
  gap: 16px;
`;

const GenderOption = styled.div<{ $isSelected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 12px 16px;
  border-radius: 12px;
  background: ${props => props.$isSelected ? '#e8f4fc' : '#f5f5f5'};
  border: 1px solid ${props => props.$isSelected ? '#3B9BD5' : 'transparent'};
  flex: 1;
`;

const GenderRadio = styled.div<{ $isSelected?: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${props => props.$isSelected ? '#3B9BD5' : 'rgba(16, 17, 18, 0.2)'};
  background: ${props => props.$isSelected ? '#3B9BD5' : 'transparent'};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.$isSelected ? '#ffffff' : 'transparent'};
  }
`;

const GenderLabel = styled.span`
  font-size: 14px;
  color: #101112;
`;

const Footer = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: #ffffff;
  border-top: 1px solid #f0f0f0;
`;

const SubmitButton = styled.button<{ $isActive?: boolean }>`
  width: 100%;
  padding: 16px;
  background: ${props => props.$isActive ? '#3B9BD5' : '#e5e5e5'};
  color: ${props => props.$isActive ? '#ffffff' : 'rgba(16, 17, 18, 0.4)'};
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.$isActive ? 'pointer' : 'not-allowed'};
  transition: background 0.2s, color 0.2s;
  
  &:disabled {
    cursor: not-allowed;
  }
`;
