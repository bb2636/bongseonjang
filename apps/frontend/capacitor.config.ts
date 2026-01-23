import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bongkru.app',
  appName: '봉선장',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
    // TODO: 원격 URL 사용 시 아래 주석 해제
    // url: 'https://bongseonjang--tkfkdgowjdakfas.replit.app'
  },
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: false,
    scrollEnabled: true
  },
  plugins: {
    App: {
      launchUrl: {
        scheme: 'bongseonjang'
      }
    }
  }
};

export default config;
