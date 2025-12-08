export const GUEST_ORDER_ROUTES = {
  LOOKUP: '/orders/guest',
} as const;

export const GUEST_ORDER_VALIDATION = {
  ORDER_NUMBER_MIN_LENGTH: 6,
  PHONE_REGEX: /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
} as const;

export const GUEST_ORDER_MESSAGES = {
  NAME_REQUIRED: '성함을 입력해주세요',
  ORDER_NUMBER_REQUIRED: '주문번호를 입력해주세요',
  PHONE_REQUIRED: '연락처를 입력해주세요',
  PHONE_INVALID: '올바른 연락처를 입력해주세요',
} as const;
