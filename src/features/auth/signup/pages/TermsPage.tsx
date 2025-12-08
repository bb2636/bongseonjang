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

export default function TermsPage() {
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
        <HeaderTitle>이용약관</HeaderTitle>
      </Header>

      <Content>
        <Section>
          <SectionTitle>제1조 (목적)</SectionTitle>
          <SectionContent>
            본 약관은 봉선장(이하 "회사")이 제공하는 서비스의 이용 조건 및 절차, 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </SectionContent>
        </Section>

        <Section>
          <SectionTitle>제2조 (정의)</SectionTitle>
          <SectionContent>
            1. "서비스"란 회사가 제공하는 모든 온라인 서비스를 말합니다.{'\n'}
            2. "이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.{'\n'}
            3. "회원"이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 서비스를 이용할 수 있는 자를 말합니다.
          </SectionContent>
        </Section>

        <Section>
          <SectionTitle>제3조 (약관의 효력 및 변경)</SectionTitle>
          <SectionContent>
            1. 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 공지함으로써 효력이 발생합니다.{'\n'}
            2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.
          </SectionContent>
        </Section>
      </Content>
    </Container>
  );
}
