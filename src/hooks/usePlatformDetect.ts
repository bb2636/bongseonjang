import { useState, useEffect } from 'react';

interface PlatformInfo {
  isInApp: boolean;
  isFlutterWebView: boolean;
  isReactNativeWebView: boolean;
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

function computePlatformInfo(): PlatformInfo {
  const isFlutterWebView = checkIsFlutterWebView();
  const isReactNativeWebView = checkIsReactNativeWebView();
  const isPwa = checkIsPwa();
  const isUrlParamApp = checkUrlParam();
  const isUserAgentApp = checkUserAgent();

  const isInApp = isFlutterWebView || isReactNativeWebView || isUrlParamApp || isUserAgentApp;
  const isWebBrowser = !isInApp && !isPwa;

  return {
    isInApp,
    isFlutterWebView,
    isReactNativeWebView,
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

  return platformInfo;
}
