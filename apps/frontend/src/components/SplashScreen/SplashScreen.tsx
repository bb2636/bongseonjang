import { useState, useEffect } from 'react';
import splashImage from '../../assets/splash.png';
import './SplashScreen.css';

const SPLASH_SHOWN_KEY = 'bongkru_splash_shown';

interface SplashScreenProps {
  children: React.ReactNode;
  duration?: number;
}

export function SplashScreen({ children, duration = 2500 }: SplashScreenProps) {
  // TODO: 스플래시 화면 임시 비활성화 - 나중에 다시 활성화할 것
  // const alreadyShown = sessionStorage.getItem(SPLASH_SHOWN_KEY) === 'true';
  // const [showSplash, setShowSplash] = useState(!alreadyShown);
  // const [fadeOut, setFadeOut] = useState(false);

  // useEffect(() => {
  //   if (alreadyShown) {
  //     return;
  //   }

  //   sessionStorage.setItem(SPLASH_SHOWN_KEY, 'true');

  //   const fadeTimer = setTimeout(() => {
  //     setFadeOut(true);
  //   }, duration);

  //   const hideTimer = setTimeout(() => {
  //     setShowSplash(false);
  //   }, duration + 500);

  //   return () => {
  //     clearTimeout(fadeTimer);
  //     clearTimeout(hideTimer);
  //   };
  // }, [duration, alreadyShown]);

  // 스플래시 비활성화 - children만 렌더링
  return <>{children}</>;

  // 원래 코드 (나중에 활성화):
  // return (
  //   <>
  //     {showSplash && (
  //       <div className={`splash-screen ${fadeOut ? 'splash-screen--fade-out' : ''}`}>
  //         <img 
  //           src={splashImage} 
  //           alt="봉선장" 
  //           className="splash-screen__image"
  //         />
  //       </div>
  //     )}
  //     {children}
  //   </>
  // );
}
