interface VerifyReferralResponse {
  exists: boolean;
  message: string;
}

export async function verifyReferralId(referralId: string): Promise<VerifyReferralResponse> {
  const response = await fetch('/api/referral/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ referralId }),
  });

  if (!response.ok) {
    throw new Error('추천인 확인에 실패했습니다');
  }

  return response.json();
}
