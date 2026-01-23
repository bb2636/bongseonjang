const PRODUCTION_API_URL = 'https://bongseonjang--tkfkdgowjdakfas.replit.app/api';

declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform?: () => boolean;
      getPlatform?: () => string;
    };
  }
}

function isCapacitorEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  
  if (window.Capacitor?.isNativePlatform?.()) {
    return true;
  }
  
  const protocol = window.location.protocol;
  if (protocol === 'capacitor:' || protocol === 'ionic:') {
    return true;
  }
  
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    if (protocol === 'https:' || protocol === 'http:') {
      const isDevServer = window.location.port === '5000' || window.location.port === '5173';
      if (!isDevServer) {
        return true;
      }
    }
  }
  
  return false;
}

function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (import.meta.env.MODE === 'production' || import.meta.env.MODE === 'capacitor') {
    return PRODUCTION_API_URL;
  }
  
  if (isCapacitorEnvironment()) {
    return PRODUCTION_API_URL;
  }
  
  return '/api';
}

export const API_BASE_URL = getApiBaseUrl();

export const IS_CAPACITOR = isCapacitorEnvironment();

export const CAPACITOR_APP_SCHEME = 'bongseonjang';
