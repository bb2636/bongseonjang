import { config } from '../config';

const BASE = 'https://sendmail-43925.bubbleapps.io/version-test/api/1.1/wf';
const WORKFLOW = 'send-mail';

async function callBubbleWF(payload: {
  sender: string;
  title: string;
  to: string;
  code: string;
}): Promise<Record<string, unknown>> {
  const TOKEN = config.bubbleApiToken;

  if (!TOKEN) {
    throw new Error('BUBBLE_API_TOKEN environment variable is required');
  }

  const res = await fetch(`${BASE}/${WORKFLOW}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || (data as { status?: string })?.status === 'error') {
    throw new Error(
      `Bubble WF fail: ${res.status} ${res.statusText}\n` +
        `${typeof data === 'object' ? JSON.stringify(data) : String(data)}`
    );
  }

  return data as Record<string, unknown>;
}

export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  try {
    await callBubbleWF({
      sender: '봉선장',
      title: '봉선장 이메일 인증',
      to: email,
      code: code,
    });
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('이메일 전송에 실패했습니다');
  }
}

export async function sendPasswordResetEmail(email: string, code: string): Promise<boolean> {
  try {
    await callBubbleWF({
      sender: '봉선장',
      title: '봉선장 비밀번호 재설정',
      to: email,
      code: code,
    });
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('이메일 전송에 실패했습니다');
  }
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
