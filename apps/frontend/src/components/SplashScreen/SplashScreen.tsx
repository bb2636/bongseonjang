import { useState, useEffect } from 'react';
import splashImage from '../../assets/splash.png';
import './SplashScreen.css';

interface SplashScreenProps {
  children: React.ReactNode;
  duration?: number;
}

export function SplashScreen({ children, duration = 2500 }: SplashScreenProps) {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
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
  }, [duration]);

  if (!showSplash) {
    return <>{children}</>;
  }

  return (
    <>
      <div className={`splash-screen ${fadeOut ? 'splash-screen--fade-out' : ''}`}>
        <img 
          src={splashImage} 
          alt="봉선장" 
          className="splash-screen__image"
        />
      </div>
      <div style={{ display: 'none' }}>{children}</div>
    </>
  );
}
