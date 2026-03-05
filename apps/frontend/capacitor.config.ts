import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bongseongjang.app',
  appName: '봉선장',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    allowNavigation: [
      '*.daumcdn.net',
      '*.daum.net',
      '*.kakao.com',
    ]
  },
  android: {
    overScrollMode: 'never',
    backgroundColor: '#FFFFFF'
  },
  ios: {
    contentInset: 'never',
    allowsLinkPreview: false,
    scrollEnabled: true,
    backgroundColor: '#FFFFFF',
    infoPlist: {
      NSPhotoLibraryUsageDescription: '상품 문의 및 리뷰 작성 시 사진을 첨부하기 위해 사진 라이브러리 접근 권한이 필요합니다.',
      NSCameraUsageDescription: '상품 문의 및 리뷰 작성 시 사진을 촬영하기 위해 카메라 접근 권한이 필요합니다.',
      NSPhotoLibraryAddUsageDescription: '촬영한 사진을 저장하기 위해 사진 라이브러리 저장 권한이 필요합니다.',
      NSFaceIDUsageDescription: '안전한 결제를 위해 Face ID 인증이 필요합니다.',
      NSUserTrackingUsageDescription: '더 나은 서비스 제공을 위해 앱 사용 데이터를 수집합니다. 수집된 데이터는 서비스 개선 목적으로만 사용됩니다.',
      NSMicrophoneUsageDescription: '동영상 촬영 시 오디오 녹음을 위해 마이크 접근 권한이 필요합니다.',
      NSLocationWhenInUseUsageDescription: '주변 매장 검색 및 배송지 설정을 위해 위치 정보가 필요합니다.',
      ITSAppUsesNonExemptEncryption: false
    }
  },
  plugins: {}

};

export default config;
