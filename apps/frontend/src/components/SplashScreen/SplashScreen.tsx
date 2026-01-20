import { useState, useEffect } from 'react';
import splashImage from '../../assets/splash.png';
import './SplashScreen.css';

const SPLASH_SHOWN_KEY = 'bongkru_splash_shown';

interface SplashScreenProps {
  children: React.ReactNode;
  duration?: number;
}

export function SplashScreen({ children, duration = 2500 }: SplashScreenProps) {
  const alreadyShown = sessionStorage.getItem(SPLASH_SHOWN_KEY) === 'true';
  const [showSplash, setShowSplash] = useState(!alreadyShown);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (alreadyShown) {
      return;
    }

    sessionStorage.setItem(SPLASH_SHOWN_KEY, 'true');

    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, duration);

    const hideTimer = setTimeout(() => {
      setShowSplash(false);
    }, duration + 500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, alreadyShown]);

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
