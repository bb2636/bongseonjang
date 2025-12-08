import { ChangeEvent } from "react";
import styled, { keyframes } from "styled-components";
import { AlertModal } from "@components";

interface SignupEmailViewProps {
  signupEmail: {
    email: string;
    verificationCode: string;
    isCodeSent: boolean;
    isEmailVerified: boolean;
    isLoading: boolean;
    isVerifying: boolean;
    isConfirming: boolean;
    isEmailValid: boolean;
    isCodeValid: boolean;
    isValid: boolean;
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
