import { useSplashOptional } from '@/contexts';
import splashImage from '@/assets/images/splash-screen.png';
import './SplashScreen.css';

interface SplashScreenProps {
  children: React.ReactNode;
}

export function SplashScreen({ children }: SplashScreenProps) {
  const splashContext = useSplashOptional();
  const showSplash = splashContext?.showSplash ?? false;
  const fadeOut = splashContext?.fadeOut ?? false;

  return (
    <>
      {showSplash && (
        <div 
          className={`splash-screen ${fadeOut ? 'splash-screen--fade-out' : ''}`}
          style={{ pointerEvents: fadeOut ? 'none' : 'auto' }}
        >
          <img 
            src={splashImage} 
            alt="봉선장" 
            className="splash-screen__image"
          />
        </div>
      )}
      {children}
    </>
  );
}
