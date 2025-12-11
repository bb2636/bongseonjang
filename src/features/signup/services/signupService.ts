const API_BASE_URL = '/api';

export interface SignupResponse {
  success: boolean;
  message?: string;
  token?: string;
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
}

export interface EmailVerificationResponse {
  success: boolean;
  message: string;
}

export interface ReferralVerifyResponse {
  exists: boolean;
  message: string;
}

export const signupService = {
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

  async signup(data: SignupData): Promise<SignupResponse> {
    const birthDate = `${data.birthYear}-${data.birthMonth.padStart(2, '0')}-${data.birthDay.padStart(2, '0')}`;
    
    const requestBody = {
      email: data.email,
      password: data.password,
      name: data.name,
      phone: data.phone,
      birthDate,
      gender: data.gender,
      referralId: data.referralId || undefined,
    };

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || '회원가입에 실패했습니다');
    }

    return { success: true, token: result.token };
  },
};
