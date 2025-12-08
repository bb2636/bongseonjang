import styled from 'styled-components';

interface AgreementSectionProps {
  isOver14: boolean;
  termsAgreed: boolean;
  privacyAgreed: boolean;
  onOver14Change: (value: boolean) => void;
  onTermsAgreedChange: (value: boolean) => void;
  onPrivacyAgreedChange: (value: boolean) => void;
  onAllAgreeChange: (value: boolean) => void;
  onTermsDetailClick: () => void;
  onPrivacyDetailClick: () => void;
}

const Container = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 4px 12px;
  width: 100%;
  border: 1px solid rgba(12, 12, 12, 0.06);
  border-radius: 8px;
`;

const AllAgreeRow = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px 0px;
  gap: 10px;
  width: 100%;
  border-bottom: 1px solid rgba(12, 12, 12, 0.06);
  cursor: pointer;
`;

const ItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  width: 100%;
`;

const ItemRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0px;
  gap: 10px;
  width: 100%;
  cursor: pointer;
`;

const ItemLeftSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 10px;
`;

const CheckboxIcon = styled.div<{ $checked: boolean }>`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LabelContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 6px;
`;

const AllAgreeLabel = styled.span`
  font-family: 'Pretendard';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 128%;
  letter-spacing: -0.01em;
  color: #0C0C0C;
`;

const ItemLabel = styled.span`
  font-family: 'Pretendard';
  font-style: normal;
  font-weight: 400;
  font-size: 13px;
  line-height: 128%;
  letter-spacing: -0.01em;
  color: rgba(12, 12, 12, 0.8);
`;

const RequiredBadge = styled.span`
  font-family: 'Pretendard';
  font-style: normal;
  font-weight: 500;
  font-size: 13px;
  line-height: 128%;
  letter-spacing: -0.01em;
  color: #0C95F6;
`;

const ArrowIcon = styled.div`
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

function CheckedBox() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#3B9BD5"/>
      <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function UncheckedBox() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" stroke="rgba(12, 12, 12, 0.3)" strokeWidth="1"/>
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M6.75 13.5L11.25 9L6.75 4.5" stroke="#3B9BD5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function AgreementSection({
  isOver14,
  termsAgreed,
  privacyAgreed,
  onOver14Change,
  onTermsAgreedChange,
  onPrivacyAgreedChange,
  onAllAgreeChange,
  onTermsDetailClick,
  onPrivacyDetailClick,
}: AgreementSectionProps) {
  const allAgreed = isOver14 && termsAgreed && privacyAgreed;

  const handleAllAgreeClick = () => {
    onAllAgreeChange(!allAgreed);
  };

  const handleOver14Click = () => {
    onOver14Change(!isOver14);
  };

  const handleTermsClick = () => {
    onTermsAgreedChange(!termsAgreed);
  };

  const handlePrivacyClick = () => {
    onPrivacyAgreedChange(!privacyAgreed);
  };

  const handleTermsDetailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTermsDetailClick();
  };

  const handlePrivacyDetailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPrivacyDetailClick();
  };

  return (
    <Container>
      <AllAgreeRow onClick={handleAllAgreeClick}>
        <CheckboxIcon $checked={allAgreed}>
          {allAgreed ? <CheckedBox /> : <UncheckedBox />}
        </CheckboxIcon>
        <AllAgreeLabel>약관 전체동의</AllAgreeLabel>
      </AllAgreeRow>

      <ItemsContainer>
        <ItemRow onClick={handleOver14Click}>
          <ItemLeftSection>
            <CheckboxIcon $checked={isOver14}>
              {isOver14 ? <CheckedBox /> : <UncheckedBox />}
            </CheckboxIcon>
            <LabelContainer>
              <ItemLabel>만 14세 이상입니다</ItemLabel>
              <RequiredBadge>필수</RequiredBadge>
            </LabelContainer>
          </ItemLeftSection>
        </ItemRow>

        <ItemRow onClick={handleTermsClick}>
          <ItemLeftSection>
            <CheckboxIcon $checked={termsAgreed}>
              {termsAgreed ? <CheckedBox /> : <UncheckedBox />}
            </CheckboxIcon>
            <LabelContainer>
              <ItemLabel>이용약관</ItemLabel>
              <RequiredBadge>필수</RequiredBadge>
            </LabelContainer>
          </ItemLeftSection>
          <ArrowIcon onClick={handleTermsDetailClick}>
            <ArrowRight />
          </ArrowIcon>
        </ItemRow>

        <ItemRow onClick={handlePrivacyClick}>
          <ItemLeftSection>
            <CheckboxIcon $checked={privacyAgreed}>
              {privacyAgreed ? <CheckedBox /> : <UncheckedBox />}
            </CheckboxIcon>
            <LabelContainer>
              <ItemLabel>개인정보 처리방침</ItemLabel>
              <RequiredBadge>필수</RequiredBadge>
            </LabelContainer>
          </ItemLeftSection>
          <ArrowIcon onClick={handlePrivacyDetailClick}>
            <ArrowRight />
          </ArrowIcon>
        </ItemRow>
      </ItemsContainer>
    </Container>
  );
}
