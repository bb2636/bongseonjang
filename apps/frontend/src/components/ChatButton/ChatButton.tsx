import './ChatButton.css';

interface ChatButtonProps {
  onClick?: () => void;
  className?: string;
  bottomOffset?: number;
}

export default function ChatButton({ onClick, className = '', bottomOffset = 80 }: ChatButtonProps) {
  return (
    <button 
      type="button" 
      className={`chat-button ${className}`}
      onClick={onClick}
      aria-label="채팅 상담 열기"
      style={{ bottom: `${bottomOffset}px` }}
    >
      <span className="chat-button__icon" aria-hidden>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="6" fill="white" />
          <path
            d="M7.5 9C7.5 7.89543 8.39543 7 9.5 7H18.5C19.6046 7 20.5 7.89543 20.5 9V15C20.5 16.1046 19.6046 17 18.5 17H11.75L8.5 20.25V15C8.5 14.4477 8.05228 14 7.5 14V9Z"
            fill="#0579CA"
          />
        </svg>
      </span>
    </button>
  );
}
