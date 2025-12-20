import { 
  AuthResult,
  EmailVerificationResponse, 
  CheckEmailResponse, 
  ReferralVerifyResponse 
} from '@bongkru/contract';
import { API_BASE_URL } from '../../../shared/config/apiConfig';

type SignupResult = AuthResult;

const ERROR_MESSAGES: Record<string, string> = {
  'Email already in use': '이미 가입된 이메일입니다.',
};

function translateErrorMessage(message: string): string {
  return ERROR_MESSAGES[message] || message;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  phone: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  gender: string;
  referralId?: string;
  addressName: string;
  zonecode: string;
  address: string;
  addressDetail: string;
}

export const signupService = {
  async checkEmail(email: string): Promise<CheckEmailResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error('이메일 확인에 실패했습니다');
    }

    return data;
  },

  async sendVerificationCode(email: string): Promise<EmailVerificationResponse> {
    const response = await fetch(`${API_BASE_URL}/email-verification/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '이메일 전송에 실패했습니다');
    }

    return data;
  },

  async verifyCode(email: string, code: string): Promise<EmailVerificationResponse> {
    const response = await fetch(`${API_BASE_URL}/email-verification/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '인증에 실패했습니다');
    }

    return data;
  },

  async verifyReferralId(referralId: string): Promise<ReferralVerifyResponse> {
    const response = await fetch(`${API_BASE_URL}/referral/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referralId }),
    });

    if (!response.ok) {
      throw new Error('추천인 확인에 실패했습니다');
    }

    return response.json();
  },

  async signup(data: SignupData): Promise<SignupResult> {
    const birthDate = `${data.birthYear}-${data.birthMonth.padStart(2, '0')}-${data.birthDay.padStart(2, '0')}`;
    
    const requestBody = {
      email: data.email,
      password: data.password,
      name: data.name,
      phone: data.phone,
      birthDate,
      gender: data.gender,
      referralId: data.referralId || undefined,
      addressName: data.addressName,
      zonecode: data.zonecode,
      address: data.address,
      addressDetail: data.addressDetail,
    };

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = translateErrorMessage(result.message || '회원가입에 실패했습니다');
      throw new Error(errorMessage);
    }

    return result;
  },
};
