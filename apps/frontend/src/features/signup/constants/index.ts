export const SIGNUP_MESSAGES = {
  REQUIRED: '필수 입력 항목입니다',
  EMAIL_INVALID: '올바른 이메일 형식이 아닙니다',
} as const;

export const SIGNUP_VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;
