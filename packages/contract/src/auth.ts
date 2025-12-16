export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  profileImage?: string | null;
  phone?: string | null;
  birthDate?: Date | null;
  gender?: string | null;
  referralId?: string | null;
  membershipGrade?: string;
  isEmailVerified?: boolean;
  lastLoginAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResult {
  user: UserResponse;
  token: string;
}

export type LoginResponse = AuthResult;

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  referralId?: string;
  zonecode?: string;
  address?: string;
  addressDetail?: string;
  addressName?: string;
  agreedTerms?: string[];
}

export type SignupResponse = AuthResult;

export interface CheckEmailRequest {
  email: string;
}

export interface CheckEmailResponse {
  exists: boolean;
}

export interface ReferralVerifyResponse {
  exists: boolean;
  message: string;
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
