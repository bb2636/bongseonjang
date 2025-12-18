export type CouponDiscountType = 'FIXED' | 'RATE' | 'SHIPPING';
export type CouponApplyType = 'ALL_PRODUCTS' | 'CATEGORIES';
export type CouponIssueType = 'ALL_USERS' | 'NEW_USERS' | 'GRADES';
export type UserCouponStatus = 'AVAILABLE' | 'USED' | 'EXPIRED';

export interface CouponDto {
  id: number;
  name: string;
  description: string | null;
  discountType: CouponDiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export interface UserCouponDto {
  id: number;
  coupon: CouponDto;
  status: UserCouponStatus;
  issuedAt: string;
  usedAt: string | null;
  expiresAt: string;
}

export interface DownloadCouponRequest {
  couponId: number;
}

export interface DownloadCouponResponse {
  success: boolean;
  userCouponId?: number;
  message?: string;
}

export interface CouponListRequest {
  status?: UserCouponStatus;
  page?: number;
  limit?: number;
}

export interface CouponListResponse {
  coupons: UserCouponDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface AvailableCouponListRequest {
  page?: number;
  limit?: number;
}

export interface AvailableCouponListResponse {
  coupons: CouponDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApplyCouponRequest {
  orderId: string;
  couponId: number;
}

export interface ApplyCouponResponse {
  success: boolean;
  discountAmount: number;
  message?: string;
}
