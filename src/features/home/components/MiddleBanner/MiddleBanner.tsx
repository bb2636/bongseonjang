import './MiddleBanner.css';

interface MiddleBannerProps {
  onClick?: () => void;
}

export default function MiddleBanner({ onClick }: MiddleBannerProps) {
  return (
    <div className="middle-banner" onClick={onClick} role="button" tabIndex={0}>
      <div className="middle-banner__placeholder" />
    </div>
  );
}
