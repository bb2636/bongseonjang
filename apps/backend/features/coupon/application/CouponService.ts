import { CouponRepository, CouponWithDetails } from '../repository/CouponRepository';

interface CouponDto {
  id: number;
  name: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number;
  targetType: string;
  validFrom: Date | null;
  validTo: Date | null;
  isIssued: boolean;
}

interface CouponListResponse {
  coupons: CouponDto[];
  totalCount: number;
}

export class CouponService {
  private repository: CouponRepository;

  constructor() {
    this.repository = new CouponRepository();
  }

  async getCouponsForUser(userId: string): Promise<CouponListResponse> {
    const availableCoupons = await this.repository.findAvailableCoupons();
    const userCoupons = await this.repository.findUserCoupons(userId);
    const issuedCouponIds = new Set(userCoupons.map(uc => uc.couponId));

    const coupons: CouponDto[] = availableCoupons.map(coupon => this.toCouponDto(coupon, issuedCouponIds.has(coupon.id)));

    return {
      coupons,
      totalCount: coupons.length,
    };
  }

  async issueCoupon(couponId: number, userId: string): Promise<{ success: boolean; message: string }> {
    const coupon = await this.repository.findCouponById(couponId);

    if (!coupon) {
      return { success: false, message: '쿠폰을 찾을 수 없습니다' };
    }

    if (!coupon.isActive) {
      return { success: false, message: '비활성화된 쿠폰입니다' };
    }

    if (coupon.validFrom && coupon.validTo) {
      const now = new Date();
      if (coupon.validFrom > now || coupon.validTo < now) {
        return { success: false, message: '유효하지 않은 쿠폰입니다' };
      }
    }

    const canIssueResult = await this.repository.canUserIssueCoupon(couponId, userId);
    if (!canIssueResult.canIssue) {
      return { success: false, message: canIssueResult.reason || '발급 대상이 아닙니다' };
    }

    const existingCoupon = await this.repository.findUserCoupon(couponId, userId);
    if (existingCoupon) {
      return { success: false, message: '이미 발급받은 쿠폰입니다' };
    }

    const { validFrom, validTo } = await this.repository.calculateValidityDates(couponId);
    await this.repository.createUserCoupon(couponId, userId, validFrom, validTo);

    return { success: true, message: '쿠폰이 발급되었습니다' };
  }

  async getMyCoupons(userId: string): Promise<CouponDto[]> {
    const userCoupons = await this.repository.findUserCoupons(userId);
    const result: CouponDto[] = [];

    for (const userCoupon of userCoupons) {
      if (!userCoupon.coupon) continue;

      const couponDetails = await this.repository.findCouponById(userCoupon.couponId);
      if (!couponDetails) continue;

      const validFrom = userCoupon.validFrom || couponDetails.validFrom;
      const validTo = userCoupon.validTo || couponDetails.validTo;

      if (validTo && validTo < new Date()) continue;

      result.push({
        id: userCoupon.id,
        name: couponDetails.name,
        description: couponDetails.description,
        discountType: couponDetails.discountType,
        discountValue: couponDetails.discountValue,
        maxDiscountAmount: couponDetails.maxDiscountAmount,
        minOrderAmount: couponDetails.minOrderAmount,
        targetType: couponDetails.targetType,
        validFrom,
        validTo,
        isIssued: true,
      });
    }

    return result;
  }

  private toCouponDto(coupon: CouponWithDetails, isIssued: boolean): CouponDto {
    return {
      id: coupon.id,
      name: coupon.name,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscountAmount: coupon.maxDiscountAmount,
      minOrderAmount: coupon.minOrderAmount,
      targetType: coupon.targetType,
      validFrom: coupon.validFrom,
      validTo: coupon.validTo,
      isIssued,
    };
  }
}
