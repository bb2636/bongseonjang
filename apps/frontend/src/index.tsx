import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import App from './App';
import './styles/global.css';
import { AuthProvider, ToastProvider, CartProvider, QuickCartProvider } from './contexts';
import { ToastManager, QuickCartBottomSheet, PlatformInit, ScrollToTop } from './components';

(function initPlatformSafeArea() {
  const platform = Capacitor.getPlatform();
  const isNative = Capacitor.isNativePlatform();
  
  if (isNative && platform === 'android') {
    document.documentElement.style.setProperty('--safe-area-top', '0px');
    document.documentElement.style.setProperty('--safe-area-bottom', '0px');
    document.documentElement.classList.add('platform-android');
  } else if (isNative && platform === 'ios') {
    document.documentElement.classList.add('platform-ios');
  } else {
    document.documentElement.classList.add('platform-web');
  }
})();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const initialLoader = document.getElementById('initial-loader');
if (initialLoader) {
  initialLoader.classList.add('hidden');
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <PlatformInit>
          <AuthProvider>
            <CartProvider>
              <ToastProvider>
                <QuickCartProvider>
                  <App />
                  <QuickCartBottomSheet />
                  <ToastManager />
                </QuickCartProvider>
              </ToastProvider>
            </CartProvider>
          </AuthProvider>
        </PlatformInit>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
