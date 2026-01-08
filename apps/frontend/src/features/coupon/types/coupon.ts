export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountType: 'fixed' | 'percent' | 'shipping';
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number;
  targetType: string;
  validFrom: string;
  validTo: string;
  isIssued: boolean;
}

export interface CouponListResponse {
  coupons: Coupon[];
  totalCount: number;
}
