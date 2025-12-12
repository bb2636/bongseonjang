import { useNavigate } from 'react-router-dom';
import './DetailAppBar.css';

interface DetailAppBarProps {
  productName?: string;
  onShare?: () => void;
}

export default function DetailAppBar({ productName, onShare }: DetailAppBarProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="detail-app-bar">
      <button className="detail-app-bar__back" onClick={handleBack}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="#0C0C0C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      <span className="detail-app-bar__title">{productName || ''}</span>
      
      <button className="detail-app-bar__share" onClick={onShare}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="rgba(12, 12, 12, 0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="16,6 12,2 8,6" stroke="rgba(12, 12, 12, 0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="12" y1="2" x2="12" y2="15" stroke="rgba(12, 12, 12, 0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
