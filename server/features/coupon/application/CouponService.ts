import { CouponRepository } from '../repository/CouponRepository';

interface CouponDto {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number;
  targetType: string;
  validFrom: Date;
  validTo: Date;
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
    const userIssuances = await this.repository.findUserIssuances(userId);
    const issuedCouponIds = new Set(userIssuances.map(i => i.couponId));

    const coupons: CouponDto[] = availableCoupons.map(coupon => ({
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscountAmount: coupon.maxDiscountAmount,
      minOrderAmount: coupon.minOrderAmount,
      targetType: coupon.targetType,
      validFrom: coupon.validFrom,
      validTo: coupon.validTo,
      isIssued: issuedCouponIds.has(coupon.id),
    }));

    return {
      coupons,
      totalCount: coupons.length,
    };
  }

  async issueCoupon(couponId: string, userId: string): Promise<{ success: boolean; message: string }> {
    const coupon = await this.repository.findCouponById(couponId);

    if (!coupon) {
      return { success: false, message: '쿠폰을 찾을 수 없습니다' };
    }

    const now = new Date();
    if (coupon.validFrom > now || coupon.validTo < now) {
      return { success: false, message: '유효하지 않은 쿠폰입니다' };
    }

    if (!coupon.isActive) {
      return { success: false, message: '비활성화된 쿠폰입니다' };
    }

    if (coupon.totalQuantity !== null && coupon.usedQuantity >= coupon.totalQuantity) {
      return { success: false, message: '쿠폰이 모두 소진되었습니다' };
    }

    const userIssuanceCount = await this.repository.countUserIssuances(couponId, userId);
    if (userIssuanceCount >= coupon.useLimitPerUser) {
      return { success: false, message: '이미 발급받은 쿠폰입니다' };
    }

    await this.repository.createIssuance(couponId, userId, coupon.validTo);
    await this.repository.incrementUsedQuantity(couponId);

    return { success: true, message: '쿠폰이 발급되었습니다' };
  }

  async getMyCoupons(userId: string): Promise<CouponDto[]> {
    const issuances = await this.repository.findUserIssuances(userId);

    return issuances
      .filter(i => i.coupon)
      .map(i => ({
        id: i.coupon.id,
        code: i.coupon.code,
        name: i.coupon.name,
        description: i.coupon.description,
        discountType: i.coupon.discountType,
        discountValue: i.coupon.discountValue,
        maxDiscountAmount: i.coupon.maxDiscountAmount,
        minOrderAmount: i.coupon.minOrderAmount,
        targetType: i.coupon.targetType,
        validFrom: i.coupon.validFrom,
        validTo: i.coupon.validTo,
        isIssued: true,
      }));
  }
}
