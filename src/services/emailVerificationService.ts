const API_BASE_URL = '/api';

interface ApiResponse {
  success: boolean;
  message: string;
}

export async function sendVerificationCode(email: string): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/email-verification/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || '이메일 전송에 실패했습니다');
  }

  return data;
}

export async function verifyCode(email: string, code: string): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}/email-verification/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, code }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || '인증에 실패했습니다');
  }

  return data;
}
