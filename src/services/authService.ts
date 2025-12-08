const API_BASE_URL = '/api';

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
}

export const authService = {
  async loginWithKakao(): Promise<AuthResponse> {
    return { success: false, message: '카카오 로그인은 아직 구현되지 않았습니다.' };
  },

  async loginWithNaver(): Promise<AuthResponse> {
    return { success: false, message: '네이버 로그인은 아직 구현되지 않았습니다.' };
  },

  async loginWithEmail(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async signup(email: string, password: string, name: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    return response.json();
  },
};
