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

export function checkIsCapacitor(): boolean {
  return isCapacitorEnvironment();
}

export function getApiBaseUrlDynamic(): string {
  return getApiBaseUrl();
}

export const CAPACITOR_APP_SCHEME = 'bongseonjang';

export function getAbsoluteApiUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
  }
  
  if (import.meta.env.MODE === 'production' || import.meta.env.MODE === 'capacitor') {
    return PRODUCTION_API_URL;
  }
  
  if (isCapacitorEnvironment()) {
    return PRODUCTION_API_URL;
  }
  
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }
  
  return PRODUCTION_API_URL;
}

export function getCapacitorPlatform(): 'ios' | 'android' | 'web' {
  if (typeof window === 'undefined') return 'web';
  if (window.Capacitor?.getPlatform) {
    const platform = window.Capacitor.getPlatform();
    if (platform === 'ios') return 'ios';
    if (platform === 'android') return 'android';
  }
  return 'web';
}

export const IS_IOS = IS_CAPACITOR && getCapacitorPlatform() === 'ios';
export const IS_ANDROID = IS_CAPACITOR && getCapacitorPlatform() === 'android';
