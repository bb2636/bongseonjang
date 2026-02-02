import { useState, useEffect } from 'react';
import { IS_CAPACITOR } from '@/shared/config/apiConfig';
import splashImage from '@/assets/images/splash-screen.png';
import './SplashScreen.css';

const SPLASH_SHOWN_KEY = 'bongkru_splash_shown';

interface SplashScreenProps {
  children: React.ReactNode;
  duration?: number;
}

export function SplashScreen({ children, duration = 1000 }: SplashScreenProps) {
  const alreadyShown = sessionStorage.getItem(SPLASH_SHOWN_KEY) === 'true';
  const shouldShowSplash = IS_CAPACITOR && !alreadyShown;
  const [showSplash, setShowSplash] = useState(shouldShowSplash);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!shouldShowSplash) {
      return;
    }

    sessionStorage.setItem(SPLASH_SHOWN_KEY, 'true');

    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, duration);

    const hideTimer = setTimeout(() => {
      setShowSplash(false);
    }, duration + 300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, shouldShowSplash]);

  return (
    <>
      {showSplash && (
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
