import { useState } from 'react';
import styled from 'styled-components';

interface EmailLoginViewProps {
  emailLogin: {
    email: string;
    password: string;
    isLoading: boolean;
    isValid: boolean;
    errors: {
      email: string | null;
      password: string | null;
    };
    onEmailChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onEmailBlur: () => void;
    onPasswordBlur: () => void;
    onSubmit: () => void;
    onForgotPassword: () => void;
    onBack: () => void;
  };
}

export default function EmailLoginView({ emailLogin }: EmailLoginViewProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={emailLogin.onBack} aria-label="뒤로가기">
          <BackIcon>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </BackIcon>
        </BackButton>
        <HeaderTitle>이메일로 로그인</HeaderTitle>
        <HeaderSpacer />
      </Header>

      <Content>
        <FormSection>
          <InputGroup>
            <TextField>
              <Label>이메일</Label>
              <InputBox $hasError={!!emailLogin.errors.email}>
                <Input
                  type="email"
                  placeholder="이메일"
                  value={emailLogin.email}
                  onChange={(e) => emailLogin.onEmailChange(e.target.value)}
                  onBlur={emailLogin.onEmailBlur}
                />
                {emailLogin.errors.email && (
                  <ErrorMessage>{emailLogin.errors.email}</ErrorMessage>
                )}
              </InputBox>
            </TextField>

            <TextField>
              <Label>비밀번호</Label>
              <InputBox $hasError={!!emailLogin.errors.password}>
                <InputRow>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호"
                    value={emailLogin.password}
                    onChange={(e) => emailLogin.onPasswordChange(e.target.value)}
                    onBlur={emailLogin.onPasswordBlur}
                  />
                  <VisibilityButton 
                    type="button"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  >
                    {showPassword ? (
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                        <path d="M11 4.5C6 4.5 2 11 2 11C2 11 6 17.5 11 17.5C16 17.5 20 11 20 11C20 11 16 4.5 11 4.5Z" stroke="rgba(12, 12, 12, 0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="11" cy="11" r="3" stroke="rgba(12, 12, 12, 0.4)" strokeWidth="1.5"/>
                      </svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                        <path d="M11 4.5C6 4.5 2 11 2 11C2 11 6 17.5 11 17.5C16 17.5 20 11 20 11C20 11 16 4.5 11 4.5Z" stroke="rgba(12, 12, 12, 0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="11" cy="11" r="3" stroke="rgba(12, 12, 12, 0.4)" strokeWidth="1.5"/>
                        <line x1="4" y1="4" x2="18" y2="18" stroke="rgba(12, 12, 12, 0.4)" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                  </VisibilityButton>
                </InputRow>
                {emailLogin.errors.password && (
                  <ErrorMessage>{emailLogin.errors.password}</ErrorMessage>
                )}
              </InputBox>
            </TextField>
          </InputGroup>

          <SubmitButton 
            onClick={emailLogin.onSubmit}
            disabled={emailLogin.isLoading}
          >
            {emailLogin.isLoading ? '로그인 중...' : '로그인'}
          </SubmitButton>
        </FormSection>

        <ForgotPasswordLink onClick={emailLogin.onForgotPassword}>
          비밀번호를 잊어버렸어요
        </ForgotPasswordLink>
      </Content>
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
  gap: 32px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;
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
`;

const Input = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font-family-base);
  font-weight: 500;
  font-size: 14px;
  line-height: 128%;
  letter-spacing: -0.01em;
  color: #0C0C0C;
  padding: 0;

  &::placeholder {
    color: rgba(12, 12, 12, 0.3);
  }
`;

const VisibilityButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
`;

const ErrorMessage = styled.span`
  font-family: var(--font-family-base);
  font-weight: 400;
  font-size: 12px;
  line-height: 140%;
  letter-spacing: -0.01em;
  color: #FF4B3F;
`;

const SubmitButton = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 14px;
  width: 100%;
  height: 50px;
  background: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: 4px;
  cursor: pointer;
  transition: opacity var(--transition-fast);

  font-family: var(--font-family-base);
  font-weight: 600;
  font-size: 16px;
  line-height: 128%;
  letter-spacing: -0.02em;
  color: #ffffff;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ForgotPasswordLink = styled.button`
  padding: 10px;
  background: transparent;
  border: none;
  cursor: pointer;

  font-family: var(--font-family-base);
  font-weight: 400;
  font-size: 14px;
  line-height: 140%;
  letter-spacing: -0.025em;
  text-decoration: underline;
  color: rgba(12, 12, 12, 0.7);

  &:hover {
    color: rgba(12, 12, 12, 0.9);
  }
`;
