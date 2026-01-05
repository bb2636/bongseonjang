import { LoginResponse } from '@bongkru/contract';
import { API_BASE_URL } from '../../../shared/config/apiConfig';

export class AccountSuspendedError extends Error {
  code: string;
  constructor(message: string) {
    super(message);
    this.name = 'AccountSuspendedError';
    this.code = 'ACCOUNT_SUSPENDED';
  }
}

export const loginService = {
  async loginWithEmail(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.code === 'ACCOUNT_SUSPENDED') {
        throw new AccountSuspendedError(data.message || '활동이 정지된 계정입니다.');
      }
      throw new Error(data.message || '로그인에 실패했습니다');
    }

    return data;
  },

  async loginWithKakao(): Promise<LoginResponse | null> {
    throw new Error('카카오 로그인은 아직 구현되지 않았습니다.');
  },

  async loginWithNaver(): Promise<LoginResponse | null> {
    throw new Error('네이버 로그인은 아직 구현되지 않았습니다.');
  },
};
