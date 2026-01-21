import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bongkru.app',
  appName: '봉선장',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
    // TODO: 원격 URL 사용 시 아래 주석 해제
    // url: 'https://bongseonjang--tkfkdgowjdakfas.replit.app'
  }
};

export default config;
