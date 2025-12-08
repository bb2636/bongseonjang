import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const CONFETTI_COLORS = ['#3B9BD5', '#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181'];
const CONFETTI_COUNT = 20;

export interface ConfettiPiece {
  id: number;
  delay: number;
  left: number;
  color: string;
}

function generateConfettiPieces(): ConfettiPiece[] {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    left: Math.random() * 100,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
  }));
}

export function useSignupCompletePage() {
  const navigate = useNavigate();
  const confettiPiecesRef = useRef<ConfettiPiece[]>(generateConfettiPieces());

  const onLoginClick = useCallback(() => {
    sessionStorage.removeItem('signupFormData');
    navigate('/login');
  }, [navigate]);

  return {
    confettiPieces: confettiPiecesRef.current,
    onLoginClick,
  };
}
