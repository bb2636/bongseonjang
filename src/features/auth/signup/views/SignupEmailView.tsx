import { ChangeEvent } from 'react';
import styled from 'styled-components';

interface SignupEmailViewProps {
  signupEmail: {
    email: string;
    isEmailVerified: boolean;
    isLoading: boolean;
    isVerifying: boolean;
    isEmailValid: boolean;
    isValid: boolean;
    errors: {
      email: string | null;
    };
    onEmailChange: (value: string) => void;
    onEmailBlur: () => void;
    onVerifyEmail: () => void;
    onSubmit: () => void;
    onBack: () => void;
  };
}

export default function SignupEmailView({ signupEmail }: SignupEmailViewProps) {
  return (
    <Container>
      <Header>
        <BackButton onClick={signupEmail.onBack} aria-label="뒤로가기">
          <BackIcon>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                <InputRow>
                  <Input
                    type="email"
                    placeholder="이메일"
                    value={signupEmail.email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => signupEmail.onEmailChange(e.target.value)}
                    onBlur={signupEmail.onEmailBlur}
                  />
                  {signupEmail.errors.email && (
                    <ErrorMessage>{signupEmail.errors.email}</ErrorMessage>
                  )}
                </InputRow>
              </InputBox>
            </TextField>
          </InputGroup>

          <VerifyButton 
            onClick={signupEmail.onVerifyEmail}
            disabled={signupEmail.isVerifying || !signupEmail.email.trim()}
            $isActive={signupEmail.email.trim().length > 0}
          >
            {signupEmail.isVerifying ? '인증 중...' : '이메일 인증하기'}
          </VerifyButton>
        </FormSection>
      </Content>

      <Footer>
        <SubmitButton 
          onClick={signupEmail.onSubmit}
          disabled={!signupEmail.isValid || signupEmail.isLoading}
          $isActive={signupEmail.isValid}
        >
          {signupEmail.isLoading ? '처리 중...' : '다음'}
        </SubmitButton>
      </Footer>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #ffffff;
  font-family: var(--font-family-base);
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
  color: #0C0C0C;
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
  color: #0C0C0C;
`;

const InputBox = styled.div<{ $hasError?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px 16px;
  gap: 4px;
  width: 100%;
  min-height: 48px;
  background: ${props => props.$hasError ? '#ffffff' : 'rgba(12, 12, 12, 0.06)'};
  border: 1px solid ${props => props.$hasError ? '#FF4B3F' : 'transparent'};
  border-radius: 4px;
  transition: border-color var(--transition-fast), background var(--transition-fast);
`;

const InputRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 8px;
`;

const Input = styled.input`
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

const ErrorMessage = styled.span`
  flex-shrink: 0;
  font-family: var(--font-family-base);
  font-weight: 400;
  font-size: 12px;
  line-height: 128%;
  letter-spacing: -0.01em;
  color: #FF4B3F;
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
  border: 1px solid ${props => props.$isActive ? 'var(--color-primary)' : 'rgba(12, 12, 12, 0.08)'};
  border-radius: 4px;
  cursor: ${props => props.$isActive ? 'pointer' : 'not-allowed'};
  transition: border-color var(--transition-fast), opacity var(--transition-fast);

  font-family: var(--font-family-base);
  font-weight: 600;
  font-size: 16px;
  line-height: 128%;
  letter-spacing: -0.02em;
  color: ${props => props.$isActive ? 'var(--color-primary)' : 'rgba(12, 12, 12, 0.3)'};

  &:hover:not(:disabled) {
    opacity: ${props => props.$isActive ? 0.8 : 1};
  }

  &:disabled {
    cursor: not-allowed;
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
  background: ${props => props.$isActive ? 'var(--color-primary)' : 'rgba(12, 12, 12, 0.1)'};
  border: 1px solid ${props => props.$isActive ? 'var(--color-primary)' : 'rgba(12, 12, 12, 0.08)'};
  border-radius: 4px;
  cursor: ${props => props.$isActive ? 'pointer' : 'not-allowed'};
  transition: background var(--transition-fast), border-color var(--transition-fast), opacity var(--transition-fast);

  font-family: var(--font-family-base);
  font-weight: 600;
  font-size: 16px;
  line-height: 128%;
  letter-spacing: -0.02em;
  color: ${props => props.$isActive ? '#ffffff' : 'rgba(12, 12, 12, 0.3)'};

  &:hover:not(:disabled) {
    opacity: ${props => props.$isActive ? 0.9 : 1};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;
