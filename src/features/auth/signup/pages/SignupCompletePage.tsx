import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const confettiFall = keyframes`
  0% {
    transform: translateY(-100%) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  background: #FFFFFF;
  position: relative;
  overflow: hidden;
`;

const ConfettiContainer = styled.div`
  position: absolute;
  width: 352px;
  height: 316px;
  left: 50%;
  transform: translateX(-50%);
  top: 92px;
  opacity: 0.2;
  pointer-events: none;
`;

const Confetti = styled.div<{ $delay: number; $left: number; $color: string }>`
  position: absolute;
  width: 10px;
  height: 10px;
  background: ${props => props.$color};
  left: ${props => props.$left}%;
  animation: ${confettiFall} 3s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
  border-radius: 2px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 278px;
  animation: ${fadeIn} 0.6s ease-out;
`;

const MascotContainer = styled.div`
  width: 100px;
  height: 108px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 29px;
`;

const MascotIcon = styled.div`
  position: relative;
  width: 84px;
  height: 87px;
`;

const MascotBody = styled.div`
  width: 84px;
  height: 87px;
  background: #F5F5F5;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MascotEar = styled.div<{ $isLeft?: boolean }>`
  position: absolute;
  width: 18px;
  height: 25px;
  background: #F5F5F5;
  border-radius: 50%;
  top: 27px;
  ${props => props.$isLeft ? 'left: -7px;' : 'right: -7px;'}
`;

const MascotFace = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const MascotEyes = styled.div`
  display: flex;
  gap: 16px;
`;

const MascotEye = styled.div`
  width: 6px;
  height: 6px;
  background: #3B9BD5;
  border-radius: 50%;
`;

const MascotMouth = styled.div`
  width: 12px;
  height: 6px;
  border: 2px solid #3B9BD5;
  border-top: none;
  border-radius: 0 0 12px 12px;
`;

const MascotCheeks = styled.div`
  display: flex;
  gap: 30px;
  margin-top: -4px;
`;

const MascotCheek = styled.div`
  width: 8px;
  height: 4px;
  background: rgba(59, 155, 213, 0.3);
  border-radius: 4px;
`;

const MessageContainer = styled.div`
  text-align: center;
  margin-top: 8px;
`;

const Title = styled.h1`
  font-family: 'Pretendard';
  font-weight: 600;
  font-size: 20px;
  line-height: 128%;
  text-align: center;
  letter-spacing: -0.02em;
  color: #0C0C0C;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-family: 'Pretendard';
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
  text-align: center;
  color: rgba(12, 12, 12, 0.6);
  margin: 0;
`;

const ButtonContainer = styled.div`
  position: fixed;
  bottom: 46px;
  left: 50%;
  transform: translateX(-50%);
  width: 343px;
`;

const LoginButton = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 14px;
  gap: 6px;
  width: 100%;
  height: 50px;
  background: #3B9BD5;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #2A8BC5;
  }

  &:active {
    background: #1A7BB5;
  }
`;

const ButtonText = styled.span`
  font-family: 'Pretendard';
  font-weight: 600;
  font-size: 16px;
  line-height: 128%;
  letter-spacing: -0.02em;
  color: #FFFFFF;
`;

const confettiColors = ['#3B9BD5', '#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181'];

export default function SignupCompletePage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    sessionStorage.removeItem('signupFormData');
    navigate('/login');
  };

  const confettiPieces = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    left: Math.random() * 100,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
  }));

  return (
    <Container>
      <ConfettiContainer>
        {confettiPieces.map(piece => (
          <Confetti
            key={piece.id}
            $delay={piece.delay}
            $left={piece.left}
            $color={piece.color}
          />
        ))}
      </ConfettiContainer>

      <Content>
        <MascotContainer>
          <MascotIcon>
            <MascotEar $isLeft />
            <MascotEar />
            <MascotBody>
              <MascotFace>
                <MascotEyes>
                  <MascotEye />
                  <MascotEye />
                </MascotEyes>
                <MascotCheeks>
                  <MascotCheek />
                  <MascotCheek />
                </MascotCheeks>
                <MascotMouth />
              </MascotFace>
            </MascotBody>
          </MascotIcon>
        </MascotContainer>

        <MessageContainer>
          <Title>회원가입 완료!</Title>
          <Subtitle>신선한 바다를 집에서 만나보세요</Subtitle>
        </MessageContainer>
      </Content>

      <ButtonContainer>
        <LoginButton onClick={handleLoginClick}>
          <ButtonText>로그인</ButtonText>
        </LoginButton>
      </ButtonContainer>
    </Container>
  );
}
