import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_KAKAO_JS_KEY': JSON.stringify(process.env.VITE_KAKAO_JS_KEY),
    'import.meta.env.VITE_NAVER_CLIENT_ID': JSON.stringify(process.env.NAVER_CLIENT_ID),
    'import.meta.env.VITE_SOCIAL_REDIRECT_BASE_URL': JSON.stringify(process.env.VITE_SOCIAL_REDIRECT_BASE_URL || process.env.SOCIAL_REDIRECT_BASE_URL),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@features': path.resolve(__dirname, './src/features'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@bongkru/contract': path.resolve(__dirname, '../../packages/contract/src'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    cors: true,
    allowedHosts: true,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/objects': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
