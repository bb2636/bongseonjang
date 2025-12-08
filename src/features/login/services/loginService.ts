const API_BASE_URL = '/api';

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
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
      throw new Error(data.message || '로그인에 실패했습니다');
    }

    return data;
  },

  async loginWithKakao(): Promise<LoginResponse> {
    return { success: false, message: '카카오 로그인은 아직 구현되지 않았습니다.' };
  },

  async loginWithNaver(): Promise<LoginResponse> {
    return { success: false, message: '네이버 로그인은 아직 구현되지 않았습니다.' };
  },
};
