import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { IS_CAPACITOR } from '@/shared/config/apiConfig';

const SPLASH_SHOWN_KEY = 'bongkru_splash_shown';
const MIN_DISPLAY_MS = 500;
const MAX_DISPLAY_MS = 5000;

interface SplashContextValue {
  showSplash: boolean;
  signalReady: () => void;
}

const SplashContext = createContext<SplashContextValue | null>(null);

interface SplashProviderProps {
  children: React.ReactNode;
}

export function SplashProvider({ children }: SplashProviderProps) {
  const alreadyShown = sessionStorage.getItem(SPLASH_SHOWN_KEY) === 'true';
  const shouldShow = IS_CAPACITOR && !alreadyShown;
  
  const [showSplash, setShowSplash] = useState(shouldShow);
  const [isReady, setIsReady] = useState(false);
  const startTimeRef = useRef(Date.now());
  const hasHiddenRef = useRef(false);

  const hideSplash = useCallback(() => {
    if (hasHiddenRef.current) return;
    hasHiddenRef.current = true;
    
    const elapsed = Date.now() - startTimeRef.current;
    const remainingMinTime = Math.max(0, MIN_DISPLAY_MS - elapsed);
    
    setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem(SPLASH_SHOWN_KEY, 'true');
    }, remainingMinTime);
  }, []);

  const signalReady = useCallback(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!shouldShow) return;

    const timeoutId = setTimeout(() => {
      hideSplash();
    }, MAX_DISPLAY_MS);

    return () => clearTimeout(timeoutId);
  }, [shouldShow, hideSplash]);

  useEffect(() => {
    if (isReady && showSplash) {
      hideSplash();
    }
  }, [isReady, showSplash, hideSplash]);

  return (
    <SplashContext.Provider value={{ showSplash, signalReady }}>
      {children}
    </SplashContext.Provider>
  );
}

export function useSplash() {
  const context = useContext(SplashContext);
  if (!context) {
    throw new Error('useSplash must be used within a SplashProvider');
  }
  return context;
}

export function useSplashOptional() {
  return useContext(SplashContext);
}
