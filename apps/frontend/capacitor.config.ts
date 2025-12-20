import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bongkru.app',
  appName: '봉선장',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
