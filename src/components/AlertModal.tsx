import type { MouseEvent } from 'react';
import styled from 'styled-components';

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  onConfirm: () => void;
  confirmText?: string;
}

export function AlertModal({ 
  isOpen, 
  title, 
  onConfirm, 
  confirmText = '확인' 
}: AlertModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onConfirm();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalContainer>
        <HeaderSection>
          <Title>{title}</Title>
        </HeaderSection>
        <ButtonSection>
          <ConfirmButton onClick={onConfirm}>
            {confirmText}
          </ConfirmButton>
        </ButtonSection>
      </ModalContainer>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
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
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 0px;
  width: 100%;
  background: #FFFFFF;
`;

const Title = styled.span`
  font-family: 'Pretendard', sans-serif;
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
  width: 100%;
  border-top: 1px solid rgba(12, 12, 12, 0.06);
`;

const ConfirmButton = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 14px;
  width: 100%;
  height: 52px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: 'Pretendard', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 15px;
  line-height: 140%;
  letter-spacing: -0.025em;
  color: #0C95F6;
  
  &:hover {
    background: rgba(12, 149, 246, 0.05);
  }
  
  &:active {
    background: rgba(12, 149, 246, 0.1);
  }
`;
