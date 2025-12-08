import styled from 'styled-components';

interface ReferralResultModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0px 0px;
  gap: 8px;
  width: 280px;
  background: #FFFFFF;
  box-shadow: 0px -2px 70px rgba(0, 0, 0, 0.2);
  border-radius: 16px;
`;

const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  gap: 4px;
  width: 280px;
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 0px;
  gap: 12px;
  width: 280px;
  background: #FFFFFF;
`;

const HeaderText = styled.span`
  font-family: 'Pretendard';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 138%;
  letter-spacing: -0.02em;
  color: #0C0C0C;
  text-align: center;
`;

const ButtonSection = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  width: 280px;
  height: 52px;
  border-top: 1px solid rgba(12, 12, 12, 0.06);
`;

const ConfirmButton = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 14px;
  width: 280px;
  height: 52px;
  background: transparent;
  border: none;
  cursor: pointer;
  
  font-family: 'Pretendard';
  font-style: normal;
  font-weight: 500;
  font-size: 15px;
  line-height: 140%;
  letter-spacing: -0.025em;
  color: #0C95F6;
  
  &:hover {
    background: rgba(12, 149, 246, 0.05);
  }
`;

export default function ReferralResultModal({ isOpen, message, onConfirm }: ReferralResultModalProps) {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onConfirm}>
      <ModalContainer onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <HeaderSection>
          <HeaderContent>
            <HeaderText>{message}</HeaderText>
          </HeaderContent>
        </HeaderSection>
        <ButtonSection>
          <ConfirmButton onClick={onConfirm}>확인</ConfirmButton>
        </ButtonSection>
      </ModalContainer>
    </Overlay>
  );
}
