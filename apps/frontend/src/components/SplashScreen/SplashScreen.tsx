import { useState, useEffect } from 'react';
import { useSplashOptional } from '@/contexts';
import splashImage from '@/assets/images/splash-screen.png';
import './SplashScreen.css';

interface SplashScreenProps {
  children: React.ReactNode;
}

export function SplashScreen({ children }: SplashScreenProps) {
  const splashContext = useSplashOptional();
  const showSplash = splashContext?.showSplash ?? false;
  const [fadeOut, setFadeOut] = useState(false);
  const [visible, setVisible] = useState(showSplash);

  useEffect(() => {
    if (!showSplash && visible) {
      setFadeOut(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
    if (showSplash && !visible) {
      setVisible(true);
      setFadeOut(false);
    }
  }, [showSplash, visible]);

  return (
    <>
      {visible && (
        <div className={`splash-screen ${fadeOut ? 'splash-screen--fade-out' : ''}`}>
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
