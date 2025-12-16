import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/global.css';
import { AuthProvider, ToastProvider, CartProvider, QuickCartProvider } from './contexts';
import { ToastManager, QuickCartBottomSheet } from './components';

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
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
