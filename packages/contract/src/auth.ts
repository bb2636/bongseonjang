export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  birthDate?: string;
  gender?: 'male' | 'female';
  referralId?: string;
  agreedTerms: string[];
}

export interface SignupResponse {
  success: boolean;
  message: string;
  userId?: string;
}

export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerificationResponse {
  success: boolean;
  message: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  verified: boolean;
  message?: string;
}

export type SocialProvider = 'kakao' | 'naver' | 'google';

export interface SocialLoginRequest {
  provider: SocialProvider;
  accessToken: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}
