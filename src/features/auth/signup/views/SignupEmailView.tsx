import { ChangeEvent } from "react";
import styled, { keyframes } from "styled-components";
import { AlertModal } from "@components";

interface SignupEmailViewProps {
  signupEmail: {
    email: string;
    verificationCode: string;
    isCodeSent: boolean;
    isEmailVerified: boolean;
    password: string;
    passwordConfirm: string;
    showPassword: boolean;
    showPasswordConfirm: boolean;
    isLoading: boolean;
    isVerifying: boolean;
    isConfirming: boolean;
    isEmailValid: boolean;
    isCodeValid: boolean;
    isPasswordValid: boolean;
    isPasswordConfirmValid: boolean;
    isValid: boolean;
    errors: {
      email: string | null;
      verificationCode: string | null;
      password: string | null;
      passwordConfirm: string | null;
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
    onPasswordChange: (value: string) => void;
    onPasswordConfirmChange: (value: string) => void;
    onPasswordBlur: () => void;
    onPasswordConfirmBlur: () => void;
    onTogglePasswordVisibility: () => void;
    onTogglePasswordConfirmVisibility: () => void;
    onVerifyEmail: () => void;
    onResendCode: () => void;
    onConfirmCode: () => void;
    onCloseErrorModal: () => void;
    onSubmit: () => void;
    onBack: () => void;
  };
}

export default function SignupEmailView({ signupEmail }: SignupEmailViewProps) {
  return (
    <Container>
      <AlertModal
        isOpen={signupEmail.showErrorModal}
        title={signupEmail.errorModalMessage}
        onConfirm={signupEmail.onCloseErrorModal}
      />

      {signupEmail.showSnackbar && (
        <Snackbar>
          <SnackbarText>작성하신 이메일로 인증코드를 보냈어요</SnackbarText>
        </Snackbar>
      )}

      <Header>
        <BackButton onClick={signupEmail.onBack} aria-label="뒤로가기">
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
          {signupEmail.isEmailVerified ? (
            <>
              <VerifiedEmailSection>
                <TextField>
                  <Label>이메일</Label>
                  <VerifiedInputBox>
                    <VerifiedInputText>{signupEmail.email}</VerifiedInputText>
                  </VerifiedInputBox>
                </TextField>
                <VerifiedButton>이메일 인증 완료</VerifiedButton>
              </VerifiedEmailSection>

              <PasswordSection>
                <TextField>
                  <Label>비밀번호</Label>
                  <PasswordInputBox $hasError={!!signupEmail.errors.password}>
                    <PasswordInputRow>
                      <PasswordInput
                        type={signupEmail.showPassword ? "text" : "password"}
                        placeholder="비밀번호"
                        value={signupEmail.password}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          signupEmail.onPasswordChange(e.target.value)
                        }
                        onBlur={signupEmail.onPasswordBlur}
                      />
                      <VisibilityToggle
                        type="button"
                        onClick={signupEmail.onTogglePasswordVisibility}
                        aria-label={signupEmail.showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                      >
                        {signupEmail.showPassword ? (
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
                    {signupEmail.errors.password && (
                      <ErrorMessage>{signupEmail.errors.password}</ErrorMessage>
                    )}
                  </PasswordInputBox>
                </TextField>

                <TextField>
                  <Label>비밀번호 확인</Label>
                  <PasswordInputBox $hasError={!!signupEmail.errors.passwordConfirm}>
                    <PasswordInputRow>
                      <PasswordInput
                        type={signupEmail.showPasswordConfirm ? "text" : "password"}
                        placeholder="비밀번호 확인"
                        value={signupEmail.passwordConfirm}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          signupEmail.onPasswordConfirmChange(e.target.value)
                        }
                        onBlur={signupEmail.onPasswordConfirmBlur}
                      />
                      <VisibilityToggle
                        type="button"
                        onClick={signupEmail.onTogglePasswordConfirmVisibility}
                        aria-label={signupEmail.showPasswordConfirm ? "비밀번호 숨기기" : "비밀번호 보기"}
                      >
                        {signupEmail.showPasswordConfirm ? (
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
                    {signupEmail.errors.passwordConfirm && (
                      <ErrorMessage>{signupEmail.errors.passwordConfirm}</ErrorMessage>
                    )}
                  </PasswordInputBox>
                </TextField>
              </PasswordSection>
            </>
          ) : (
            <>
              <InputGroup>
                <TextField>
                  <Label>이메일</Label>
                  <InputBox $hasError={!!signupEmail.errors.email}>
                    <Input
                      type="email"
                      placeholder="이메일"
                      value={signupEmail.email}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        signupEmail.onEmailChange(e.target.value)
                      }
                      onBlur={signupEmail.onEmailBlur}
                    />
                    {signupEmail.errors.email && (
                      <ErrorMessage>{signupEmail.errors.email}</ErrorMessage>
                    )}
                  </InputBox>
                </TextField>
              </InputGroup>

              <VerifyButton
                onClick={signupEmail.onVerifyEmail}
                disabled={
                  signupEmail.isVerifying ||
                  !signupEmail.email.trim() ||
                  signupEmail.isCodeSent
                }
                $isActive={
                  signupEmail.email.trim().length > 0 && !signupEmail.isCodeSent
                }
              >
                {signupEmail.isVerifying ? "인증 중..." : "이메일 인증하기"}
              </VerifyButton>

              {signupEmail.isCodeSent && (
                <VerificationSection>
                  <TextField>
                    <Label>이메일 인증코드</Label>
                    <CodeInputBox $hasError={!!signupEmail.errors.verificationCode}>
                      <CodeInputRow>
                        <CodeInput
                          type="text"
                          inputMode="numeric"
                          placeholder="인증코드 6자리"
                          value={signupEmail.verificationCode}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            signupEmail.onCodeChange(
                              e.target.value.replace(/[^0-9]/g, ""),
                            )
                          }
                          onBlur={signupEmail.onCodeBlur}
                          maxLength={6}
                        />
                        <TimerText>{signupEmail.timer}</TimerText>
                        <ConfirmButton
                          onClick={signupEmail.onConfirmCode}
                          disabled={
                            signupEmail.isConfirming ||
                            signupEmail.verificationCode.length !== 6
                          }
                          $isActive={signupEmail.verificationCode.length === 6}
                        >
                          {signupEmail.isConfirming ? "확인 중" : "확인"}
                        </ConfirmButton>
                      </CodeInputRow>
                      {signupEmail.errors.verificationCode && (
                        <ErrorMessage>
                          {signupEmail.errors.verificationCode}
                        </ErrorMessage>
                      )}
                    </CodeInputBox>
                  </TextField>

                  <ResendLink>
                    인증코드를 받지 못하셨나요?
                    <ResendButton onClick={signupEmail.onResendCode}>
                      인증코드 재전송하기
                    </ResendButton>
                  </ResendLink>
                </VerificationSection>
              )}
            </>
          )}
        </FormSection>
      </Content>

      <Footer>
        <SubmitButton
          onClick={signupEmail.onSubmit}
          disabled={!signupEmail.isValid || signupEmail.isLoading}
          $isActive={signupEmail.isValid}
        >
          {signupEmail.isLoading ? "처리 중..." : "다음"}
        </SubmitButton>
      </Footer>
    </Container>
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
  background: rgba(12, 12, 12, 0.38);
  backdrop-filter: blur(7px);
  -webkit-backdrop-filter: blur(7px);
  border-radius: 40px;
  animation: ${slideUp} 0.3s ease-out forwards;
`;

const SnackbarText = styled.span`
  font-family: var(--font-family-base);
  font-weight: 600;
  font-size: 14px;
  line-height: 128%;
  letter-spacing: -0.01em;
  color: #fdfdfd;
`;

const Header = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 8px;
  height: 48px;
`;

const BackButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 42px;
  height: 42px;
  background: transparent;
  border: none;
  cursor: pointer;
`;

const BackIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HeaderTitle = styled.h1`
  font-family: var(--font-family-base);
  font-weight: 500;
  font-size: 16px;
  line-height: 128%;
  letter-spacing: -0.02em;
  color: #0c0c0c;
`;

const HeaderSpacer = styled.div`
  width: 42px;
  height: 42px;
`;

const Content = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 33px 16px 0;
  gap: 16px;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  max-width: 343px;
  gap: 24px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
`;

const TextField = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
`;

const Label = styled.label`
  padding: 0 4px;
  font-family: var(--font-family-base);
  font-weight: 500;
  font-size: 14px;
  line-height: 128%;
  letter-spacing: -0.01em;
  color: #0c0c0c;
`;

const InputBox = styled.div<{ $hasError?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px 16px;
  gap: 4px;
  width: 100%;
  min-height: 48px;
  background: ${(props) =>
    props.$hasError ? "#ffffff" : "rgba(12, 12, 12, 0.06)"};
  border: 1px solid ${(props) => (props.$hasError ? "#FF4B3F" : "transparent")};
  border-radius: 4px;
  transition:
    border-color var(--transition-fast),
    background var(--transition-fast);
`;

const Input = styled.input`
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font-family-base);
  font-weight: 400;
  font-size: 14px;
  line-height: 128%;
  letter-spacing: -0.01em;
  color: #101112;
  padding: 0;

  &::placeholder {
    color: rgba(12, 12, 12, 0.3);
  }
`;

const ErrorMessage = styled.span`
  font-family: var(--font-family-base);
  font-weight: 400;
  font-size: 12px;
  line-height: 128%;
  letter-spacing: -0.01em;
  color: #ff4b3f;
`;

const VerifyButton = styled.button<{ $isActive?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 14px;
  width: 100%;
  height: 44px;
  background: #ffffff;
  border: 1px solid
    ${(props) =>
      props.$isActive ? "var(--color-primary)" : "rgba(12, 12, 12, 0.08)"};
  border-radius: 4px;
  cursor: ${(props) => (props.$isActive ? "pointer" : "not-allowed")};
  transition:
    border-color var(--transition-fast),
    opacity var(--transition-fast);

  font-family: var(--font-family-base);
  font-weight: 600;
  font-size: 16px;
  line-height: 128%;
  letter-spacing: -0.02em;
  color: ${(props) =>
    props.$isActive ? "var(--color-primary)" : "rgba(12, 12, 12, 0.3)"};

  &:hover:not(:disabled) {
    opacity: ${(props) => (props.$isActive ? 0.8 : 1)};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const VerificationSection = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;
`;

const CodeInputBox = styled.div<{ $hasError?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px 16px;
  gap: 4px;
  width: 100%;
  min-height: 48px;
  background: ${(props) =>
    props.$hasError ? "#ffffff" : "rgba(12, 12, 12, 0.06)"};
  border: 1px solid ${(props) => (props.$hasError ? "#FF4B3F" : "transparent")};
  border-radius: 4px;
  transition:
    border-color var(--transition-fast),
    background var(--transition-fast);
`;

const CodeInputRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  gap: 8px;
`;

const CodeInput = styled.input`
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font-family-base);
  font-weight: 400;
  font-size: 14px;
  line-height: 128%;
  letter-spacing: -0.01em;
  color: #101112;
  padding: 0;

  &::placeholder {
    color: rgba(12, 12, 12, 0.3);
  }
`;

const TimerText = styled.span`
  font-family: var(--font-family-base);
  font-weight: 400;
  font-size: 14px;
  line-height: 128%;
  letter-spacing: -0.01em;
  color: rgba(12, 12, 12, 0.5);
  flex-shrink: 0;
`;

const ConfirmButton = styled.button<{ $isActive?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6px 12px;
  height: 28px;
  background: ${(props) =>
    props.$isActive ? "var(--color-primary)" : "rgba(12, 12, 12, 0.1)"};
  border: none;
  border-radius: 4px;
  cursor: ${(props) => (props.$isActive ? "pointer" : "not-allowed")};
  transition:
    background var(--transition-fast),
    opacity var(--transition-fast);
  flex-shrink: 0;

  font-family: var(--font-family-base);
  font-weight: 600;
  font-size: 12px;
  line-height: 128%;
  letter-spacing: -0.01em;
  color: ${(props) => (props.$isActive ? "#ffffff" : "rgba(12, 12, 12, 0.3)")};

  &:hover:not(:disabled) {
    opacity: ${(props) => (props.$isActive ? 0.9 : 1)};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const ResendLink = styled.p`
  font-family: var(--font-family-base);
  font-weight: 400;
  font-size: 13px;
  line-height: 128%;
  letter-spacing: -0.01em;
  color: rgba(12, 12, 12, 0.5);
  margin: 0;
`;

const ResendButton = styled.button`
  background: transparent;
  border: none;
  padding: 0;
  margin-left: 4px;
  font-family: var(--font-family-base);
  font-weight: 500;
  font-size: 13px;
  line-height: 128%;
  letter-spacing: -0.01em;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

const Footer = styled.footer`
  padding: 12px 16px;
  padding-bottom: 34px;
`;

const SubmitButton = styled.button<{ $isActive?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 14px;
  width: 100%;
  max-width: 343px;
  height: 44px;
  margin: 0 auto;
  background: ${(props) =>
    props.$isActive ? "var(--color-primary)" : "rgba(12, 12, 12, 0.1)"};
  border: 1px solid
    ${(props) =>
      props.$isActive ? "var(--color-primary)" : "rgba(12, 12, 12, 0.08)"};
  border-radius: 4px;
  cursor: ${(props) => (props.$isActive ? "pointer" : "not-allowed")};
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    opacity var(--transition-fast);

  font-family: var(--font-family-base);
  font-weight: 600;
  font-size: 16px;
  line-height: 128%;
  letter-spacing: -0.02em;
  color: ${(props) => (props.$isActive ? "#ffffff" : "rgba(12, 12, 12, 0.3)")};

  &:hover:not(:disabled) {
    opacity: ${(props) => (props.$isActive ? 0.9 : 1)};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const VerifiedEmailSection = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
`;

const VerifiedInputBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 4px 16px;
  width: 100%;
  height: 48px;
  background: rgba(12, 12, 12, 0.06);
  border-radius: 4px;
`;

const VerifiedInputText = styled.span`
  font-family: var(--font-family-base);
  font-weight: 400;
  font-size: 14px;
  line-height: 128%;
  letter-spacing: -0.01em;
  color: #101112;
`;

const VerifiedButton = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 14px;
  width: 100%;
  height: 44px;
  background: rgba(12, 12, 12, 0.08);
  border-radius: 4px;

  font-family: var(--font-family-base);
  font-weight: 600;
  font-size: 16px;
  line-height: 128%;
  letter-spacing: -0.02em;
  color: rgba(12, 12, 12, 0.3);
`;

const PasswordSection = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 24px;
`;

const PasswordInputBox = styled.div<{ $hasError?: boolean }>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px 16px;
  gap: 4px;
  width: 100%;
  min-height: 57px;
  background: ${(props) =>
    props.$hasError ? "#ffffff" : "rgba(12, 12, 12, 0.06)"};
  border: 1px solid ${(props) => (props.$hasError ? "#FF4B3F" : "transparent")};
  border-radius: 4px;
  transition:
    border-color var(--transition-fast),
    background var(--transition-fast);
`;

const PasswordInputRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  width: 100%;
  height: 18px;
`;

const PasswordInput = styled.input`
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font-family-base);
  font-weight: 400;
  font-size: 14px;
  line-height: 128%;
  letter-spacing: -0.01em;
  color: #101112;
  padding: 0;

  &::placeholder {
    color: rgba(12, 12, 12, 0.3);
  }
`;

const VisibilityToggle = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 22px;
  height: 22px;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    opacity: 0.7;
  }
`;
