import { useMemo } from 'react';
import completionMascot from '@assets/image/completion-mascot.svg';
import { COMPLETION_CONTENT, CompletionVariant } from './constants';
import './CompletionScreen.css';

const CONFETTI_COLORS = ['#3B9BD5', '#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3'];
const CONFETTI_COUNT = 20;

interface ConfettiPiece {
  id: number;
  color: string;
  left: number;
  delay: number;
}

interface CompletionScreenProps {
  variant: CompletionVariant;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  onButtonClick: () => void;
}

export default function CompletionScreen({
  variant,
  title,
  subtitle,
  buttonText,
  onButtonClick,
}: CompletionScreenProps) {
  const content = COMPLETION_CONTENT[variant];

  const displayTitle = title ?? content.title;
  const displaySubtitle = subtitle ?? content.subtitle;
  const displayButtonText = buttonText ?? content.buttonText;

  const confettiPieces = useMemo<ConfettiPiece[]>(() => {
    return Array.from({ length: CONFETTI_COUNT }, (_, index) => ({
      id: index,
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      left: Math.random() * 100,
      delay: Math.random() * 2,
    }));
  }, []);

  return (
    <div className="completion-screen">
      <div className="completion-screen__confetti-container">
        {confettiPieces.map(piece => (
          <div
            key={piece.id}
            className="completion-screen__confetti"
            style={{
              background: piece.color,
              left: `${piece.left}%`,
              animationDelay: `${piece.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="completion-screen__content">
        <img
          className="completion-screen__mascot-image"
          src={completionMascot}
          alt={displayTitle}
        />

        <div className="completion-screen__message-container">
          <h1 className="completion-screen__title">{displayTitle}</h1>
          {displaySubtitle && <p className="completion-screen__subtitle">{displaySubtitle}</p>}
        </div>
      </div>

      <div className="completion-screen__button-container">
        <button className="completion-screen__button" onClick={onButtonClick}>
          <span className="completion-screen__button-text">{displayButtonText}</span>
        </button>
      </div>
    </div>
  );
}
