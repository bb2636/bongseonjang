export const GUEST_ORDER_ROUTES = {
  LOOKUP: '/orders/guest',
} as const;

export const GUEST_ORDER_VALIDATION = {
  ORDER_NUMBER_MIN_LENGTH: 1,
  PASSWORD_MIN_LENGTH: 1,
} as const;

export const GUEST_ORDER_MESSAGES = {
  REQUIRED: '필수 입력 항목입니다',
} as const;
