import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  background: #FFFFFF;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  position: relative;
  border-bottom: 1px solid rgba(12, 12, 12, 0.06);
`;

const BackButton = styled.button`
  position: absolute;
  left: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HeaderTitle = styled.h1`
  font-family: 'Pretendard';
  font-weight: 600;
  font-size: 16px;
  line-height: 138%;
  color: #0C0C0C;
  margin: 0;
`;

const Content = styled.div`
  flex: 1;
  padding: 24px 16px;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-family: 'Pretendard';
  font-weight: 600;
  font-size: 14px;
  line-height: 140%;
  color: #0C0C0C;
  margin: 0 0 12px 0;
`;

const SectionContent = styled.p`
  font-family: 'Pretendard';
  font-weight: 400;
  font-size: 13px;
  line-height: 160%;
  color: rgba(12, 12, 12, 0.7);
  margin: 0;
`;

export default function PrivacyPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/signup/email');
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack} aria-label="뒤로가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="#101112"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </BackButton>
        <HeaderTitle>개인정보 처리방침</HeaderTitle>
      </Header>

      <Content>
        <Section>
          <SectionTitle>1. 개인정보 수집 항목</SectionTitle>
          <SectionContent>
            회사는 회원가입, 서비스 이용 등을 위해 아래와 같은 개인정보를 수집합니다.{'\n'}
            - 필수항목: 이메일, 비밀번호, 이름, 휴대폰번호, 생년월일, 성별{'\n'}
            - 선택항목: 추천인 아이디
          </SectionContent>
        </Section>

        <Section>
          <SectionTitle>2. 개인정보 수집 목적</SectionTitle>
          <SectionContent>
            수집한 개인정보는 다음의 목적을 위해 활용됩니다.{'\n'}
            - 서비스 제공 및 운영{'\n'}
            - 회원 관리 및 본인 확인{'\n'}
            - 서비스 개선 및 신규 서비스 개발
          </SectionContent>
        </Section>

        <Section>
          <SectionTitle>3. 개인정보 보유 기간</SectionTitle>
          <SectionContent>
            회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관련 법령에 의하여 보존할 필요가 있는 경우 일정 기간 동안 보관합니다.
          </SectionContent>
        </Section>

        <Section>
          <SectionTitle>4. 개인정보의 제3자 제공</SectionTitle>
          <SectionContent>
            회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 이용자의 동의가 있거나 법령의 규정에 의한 경우는 예외로 합니다.
          </SectionContent>
        </Section>
      </Content>
    </Container>
  );
}
