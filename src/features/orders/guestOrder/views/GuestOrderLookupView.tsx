import { ChangeEvent } from 'react';
import styled from 'styled-components';

interface GuestOrderLookupViewProps {
  guestOrderLookup: {
    name: string;
    orderNumber: string;
    phone: string;
    isLoading: boolean;
    isValid: boolean;
    errors: {
      name: string | null;
      orderNumber: string | null;
      phone: string | null;
    };
    onNameChange: (value: string) => void;
    onOrderNumberChange: (value: string) => void;
    onPhoneChange: (value: string) => void;
    onNameBlur: () => void;
    onOrderNumberBlur: () => void;
    onPhoneBlur: () => void;
    onSubmit: () => void;
    onBack: () => void;
  };
}

export default function GuestOrderLookupView({ guestOrderLookup }: GuestOrderLookupViewProps) {
  return (
    <Container>
      <Header>
        <BackButton onClick={guestOrderLookup.onBack} aria-label="뒤로가기">
          <BackIcon>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#101112" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </BackIcon>
        </BackButton>
        <HeaderTitle>비회원 주문조회</HeaderTitle>
        <HeaderSpacer />
      </Header>

      <Content>
        <FormSection>
          <InputGroup>
            <TextField>
              <Label>주문자 성함</Label>
              <InputBox $hasError={!!guestOrderLookup.errors.name}>
                <Input
                  type="text"
                  placeholder="성함"
                  value={guestOrderLookup.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => guestOrderLookup.onNameChange(e.target.value)}
                  onBlur={guestOrderLookup.onNameBlur}
                />
                {guestOrderLookup.errors.name && (
                  <ErrorMessage>{guestOrderLookup.errors.name}</ErrorMessage>
                )}
              </InputBox>
            </TextField>

            <TextField>
              <Label>주문번호</Label>
              <InputBox $hasError={!!guestOrderLookup.errors.orderNumber}>
                <Input
                  type="text"
                  placeholder="주문번호"
                  value={guestOrderLookup.orderNumber}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => guestOrderLookup.onOrderNumberChange(e.target.value)}
                  onBlur={guestOrderLookup.onOrderNumberBlur}
                />
                {guestOrderLookup.errors.orderNumber && (
                  <ErrorMessage>{guestOrderLookup.errors.orderNumber}</ErrorMessage>
                )}
              </InputBox>
            </TextField>

            <TextField>
              <Label>연락처</Label>
              <InputBox $hasError={!!guestOrderLookup.errors.phone}>
                <Input
                  type="tel"
                  placeholder="휴대폰 번호"
                  value={guestOrderLookup.phone}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => guestOrderLookup.onPhoneChange(e.target.value)}
                  onBlur={guestOrderLookup.onPhoneBlur}
                />
                {guestOrderLookup.errors.phone && (
                  <ErrorMessage>{guestOrderLookup.errors.phone}</ErrorMessage>
                )}
              </InputBox>
            </TextField>
          </InputGroup>

          <SubmitButton 
            onClick={guestOrderLookup.onSubmit}
            disabled={guestOrderLookup.isLoading}
          >
            {guestOrderLookup.isLoading ? '조회 중...' : '조회하기'}
          </SubmitButton>
        </FormSection>
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
  gap: 24px;
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

const Input = styled.input`
  flex: 1;
  width: 100%;
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
