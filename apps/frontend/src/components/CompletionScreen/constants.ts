export const COMPLETION_VARIANT = {
  SIGNUP_COMPLETE: 'SIGNUP_COMPLETE',
  PASSWORD_RESET: 'PASSWORD_RESET',
} as const;

export type CompletionVariant = typeof COMPLETION_VARIANT[keyof typeof COMPLETION_VARIANT];

interface CompletionContent {
  title: string;
  subtitle: string;
  buttonText: string;
}

export const COMPLETION_CONTENT: Record<CompletionVariant, CompletionContent> = {
  [COMPLETION_VARIANT.SIGNUP_COMPLETE]: {
    title: '회원가입 완료!\n신선한 바다를 집에서 만나보세요',
    subtitle: '',
    buttonText: '로그인',
  },
  [COMPLETION_VARIANT.PASSWORD_RESET]: {
    title: '비밀번호 변경 완료!',
    subtitle: '새 비밀번호로 로그인해주세요',
    buttonText: '로그인',
  },
};
