import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

interface PlatformInfo {
  isInApp: boolean;
  isFlutterWebView: boolean;
  isReactNativeWebView: boolean;
  isCapacitorAndroid: boolean;
  isCapacitorIOS: boolean;
  isPwa: boolean;
  isWebBrowser: boolean;
}

declare global {
  interface Window {
    flutter_inappwebview?: unknown;
    FlutterWebView?: unknown;
    ReactNativeWebView?: unknown;
  }
}

function checkIsFlutterWebView(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.flutter_inappwebview || window.FlutterWebView);
}

function checkIsReactNativeWebView(): boolean {
  if (typeof window === 'undefined') return false;
  return !!window.ReactNativeWebView;
}

function checkIsPwa(): boolean {
  if (typeof window === 'undefined') return false;
  
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  
  return isStandalone || isIosStandalone;
}

function checkUrlParam(): boolean {
  if (typeof window === 'undefined') return false;
  
  const urlParams = new URLSearchParams(window.location.search);
  const viewParam = urlParams.get('view');
  
  if (viewParam === 'app') {
    sessionStorage.setItem('platform_view', 'app');
    return true;
  }
  
  return sessionStorage.getItem('platform_view') === 'app';
}

function checkUserAgent(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  const ua = navigator.userAgent.toLowerCase();
  
  const inAppPatterns = [
    'bongseonjang',
    'flutter',
    'dart',
    'wv)',
    'webview',
  ];
  
  return inAppPatterns.some(pattern => ua.includes(pattern));
}

function checkCapacitorPlatform(): { isAndroid: boolean; isIOS: boolean } {
  try {
    const platform = Capacitor.getPlatform();
    return {
      isAndroid: platform === 'android',
      isIOS: platform === 'ios',
    };
  } catch {
    return { isAndroid: false, isIOS: false };
  }
}

function computePlatformInfo(): PlatformInfo {
  const isFlutterWebView = checkIsFlutterWebView();
  const isReactNativeWebView = checkIsReactNativeWebView();
  const isPwa = checkIsPwa();
  const isUrlParamApp = checkUrlParam();
  const isUserAgentApp = checkUserAgent();
  const capacitorPlatform = checkCapacitorPlatform();

  const isCapacitorAndroid = capacitorPlatform.isAndroid;
  const isCapacitorIOS = capacitorPlatform.isIOS;
  const isInApp = isFlutterWebView || isReactNativeWebView || isUrlParamApp || isUserAgentApp || isCapacitorAndroid || isCapacitorIOS;
  const isWebBrowser = !isInApp && !isPwa;

  return {
    isInApp,
    isFlutterWebView,
    isReactNativeWebView,
    isCapacitorAndroid,
    isCapacitorIOS,
    isPwa,
    isWebBrowser,
  };
}

export function usePlatformDetect(): PlatformInfo {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>(computePlatformInfo);

  useEffect(() => {
    const handleDisplayModeChange = () => {
      setPlatformInfo(computePlatformInfo());
    };

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  useEffect(() => {
    if (platformInfo.isCapacitorAndroid) {
      document.documentElement.style.setProperty('--safe-area-top', '0px');
      document.documentElement.style.setProperty('--safe-area-bottom', '0px');
    }
  }, [platformInfo.isCapacitorAndroid]);

  useEffect(() => {
    if (!platformInfo.isCapacitorIOS) return;

    const viewport = window.visualViewport;
    if (!viewport) return;

    const rootElement = document.getElementById('root');
    if (!rootElement) return;

    const handleViewportResize = () => {
      const keyboardHeight = window.innerHeight - viewport.height;
      if (keyboardHeight > 50) {
        rootElement.style.height = `${viewport.height}px`;
        rootElement.style.bottom = 'auto';
      } else {
        rootElement.style.height = '';
        rootElement.style.bottom = '0';
      }
    };

    viewport.addEventListener('resize', handleViewportResize);
    viewport.addEventListener('scroll', handleViewportResize);

    return () => {
      viewport.removeEventListener('resize', handleViewportResize);
      viewport.removeEventListener('scroll', handleViewportResize);
      rootElement.style.height = '';
      rootElement.style.bottom = '0';
    };
  }, [platformInfo.isCapacitorIOS]);

  return platformInfo;
}
