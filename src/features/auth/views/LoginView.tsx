import styled from 'styled-components';
import { AUTH_BUTTON_COLORS } from '../constants';

interface LoginViewProps {
  login: {
    onKakaoLogin: () => void;
    onNaverLogin: () => void;
    onEmailLogin: () => void;
    onEmailSignup: () => void;
    onGuestOrder: () => void;
    onClose: () => void;
  };
}

export default function LoginView({ login }: LoginViewProps) {
  return (
    <Container>
      <Header>
        <CloseButton onClick={login.onClose} aria-label="닫기">
          <CloseIcon>&times;</CloseIcon>
        </CloseButton>
      </Header>

      <Content>
        <LogoSection>
          <LogoCircle>
            <LogoImage src="/logo.svg" alt="봉선장" />
          </LogoCircle>
          <LogoText>봉선장</LogoText>
        </LogoSection>

        <ButtonSection>
          <SocialButtonGroup>
            <KakaoButton onClick={login.onKakaoLogin}>
              <KakaoIcon>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M9 0.5C4.029 0.5 0 3.638 0 7.5C0 9.927 1.558 12.074 3.931 13.335L2.931 16.792C2.859 17.047 3.146 17.254 3.369 17.109L7.491 14.394C7.988 14.464 8.493 14.5 9 14.5C13.971 14.5 18 11.362 18 7.5C18 3.638 13.971 0.5 9 0.5Z" fill={AUTH_BUTTON_COLORS.KAKAO_TEXT}/>
                </svg>
              </KakaoIcon>
              <ButtonText $color={AUTH_BUTTON_COLORS.KAKAO_TEXT}>카카오톡으로 계속하기</ButtonText>
            </KakaoButton>

            <NaverButton onClick={login.onNaverLogin}>
              <NaverIcon>N</NaverIcon>
              <ButtonText $color={AUTH_BUTTON_COLORS.NAVER_TEXT}>네이버로 계속하기</ButtonText>
            </NaverButton>
          </SocialButtonGroup>

          <EmailLinks>
            <EmailLink onClick={login.onEmailLogin}>이메일로 로그인</EmailLink>
            <Divider>|</Divider>
            <EmailLink onClick={login.onEmailSignup}>이메일로 회원가입</EmailLink>
          </EmailLinks>
        </ButtonSection>
      </Content>

      <Footer>
        <GuestLink onClick={login.onGuestOrder}>비회원 주문 조회하기</GuestLink>
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
  align-items: center;
  padding: 10px 8px;
  height: 48px;
`;

const CloseButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 42px;
  height: 42px;
  background: transparent;
  border: none;
  cursor: pointer;
`;

const CloseIcon = styled.span`
  font-size: 24px;
  color: rgba(12, 12, 12, 0.6);
`;

const Content = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px;
`;

const LogoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 80px;
  margin-bottom: 64px;
`;

const LogoCircle = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: var(--color-primary);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
`;

const LogoImage = styled.img`
  width: 60px;
  height: 60px;
`;

const LogoText = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--color-primary);
  letter-spacing: -0.02em;
`;

const ButtonSection = styled.div`
  width: 100%;
  max-width: 343px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const SocialButtonGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SocialButton = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 14px;
  gap: 6px;
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity var(--transition-fast);

  &:hover {
    opacity: 0.9;
  }
`;

const KakaoButton = styled(SocialButton)`
  background: ${AUTH_BUTTON_COLORS.KAKAO_BACKGROUND};
`;

const NaverButton = styled(SocialButton)`
  background: ${AUTH_BUTTON_COLORS.NAVER_BACKGROUND};
`;

const KakaoIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NaverIcon = styled.span`
  font-family: var(--font-family-base);
  font-weight: 700;
  font-size: 16px;
  color: ${AUTH_BUTTON_COLORS.NAVER_TEXT};
`;

const ButtonText = styled.span<{ $color: string }>`
  font-family: var(--font-family-base);
  font-weight: 600;
  font-size: 15px;
  line-height: 128%;
  letter-spacing: -0.02em;
  color: ${props => props.$color};
`;

const EmailLinks = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-top: 26px;
`;

const EmailLink = styled.button`
  background: transparent;
  border: none;
  font-family: var(--font-family-base);
  font-weight: 400;
  font-size: 14px;
  line-height: 140%;
  letter-spacing: -0.025em;
  color: rgba(12, 12, 12, 0.7);
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: rgba(12, 12, 12, 0.9);
  }
`;

const Divider = styled.span`
  color: rgba(12, 12, 12, 0.3);
`;

const Footer = styled.footer`
  display: flex;
  justify-content: center;
  padding: 12px;
  margin-bottom: 34px;
`;

const GuestLink = styled.button`
  background: transparent;
  border: none;
  font-family: var(--font-family-base);
  font-weight: 400;
  font-size: 14px;
  line-height: 140%;
  letter-spacing: -0.025em;
  color: rgba(12, 12, 12, 0.7);
  cursor: pointer;

  &:hover {
    color: rgba(12, 12, 12, 0.9);
  }
`;
