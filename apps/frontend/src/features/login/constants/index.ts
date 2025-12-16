export const LOGIN_ROUTES = {
  LOGIN: '/login',
  EMAIL_LOGIN: '/login/email',
  EMAIL_SIGNUP: '/signup/email',
  GUEST_ORDER: '/orders/guest',
} as const;

export const SOCIAL_PROVIDERS = {
  KAKAO: 'kakao',
  NAVER: 'naver',
} as const;

export const AUTH_BUTTON_COLORS = {
  KAKAO_BACKGROUND: '#FEE500',
  KAKAO_TEXT: '#3D1D1C',
  NAVER_BACKGROUND: '#03C75A',
  NAVER_TEXT: '#FFFFFF',
} as const;
