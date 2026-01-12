import { AppDataSource } from '../../../config/database';
import { Coupon } from '../../../entity/Coupon';
import { UserCoupon } from '../../../entity/UserCoupon';
import { CouponFixedDiscount } from '../../../entity/CouponFixedDiscount';
import { CouponRateDiscount } from '../../../entity/CouponRateDiscount';
import { CouponShippingDiscount } from '../../../entity/CouponShippingDiscount';
import { CouponValidityFixedRange } from '../../../entity/CouponValidityFixedRange';
import { CouponValidityAfterIssueDays } from '../../../entity/CouponValidityAfterIssueDays';
import { CouponApplyAllProducts } from '../../../entity/CouponApplyAllProducts';
import { CouponApplyCategory } from '../../../entity/CouponApplyCategory';
import { CouponApplyExposureCategory } from '../../../entity/CouponApplyExposureCategory';
import { CouponIssueAllUsers } from '../../../entity/CouponIssueAllUsers';
import { CouponIssueNewUsers } from '../../../entity/CouponIssueNewUsers';
import { CouponIssueGrade } from '../../../entity/CouponIssueGrade';
import { User, MembershipGrade } from '../../../entity/User';

export interface CouponWithDetails extends Coupon {
  discountType: 'fixed' | 'rate' | 'shipping';
  discountValue: number;
  maxDiscountAmount: number | null;
  validFrom: Date | null;
  validTo: Date | null;
  targetType: 'all' | 'category';
  allowMultipleUse: boolean;
}

export class CouponRepository {
  private couponRepo = AppDataSource.getRepository(Coupon);
  private userCouponRepo = AppDataSource.getRepository(UserCoupon);
  private fixedDiscountRepo = AppDataSource.getRepository(CouponFixedDiscount);
  private rateDiscountRepo = AppDataSource.getRepository(CouponRateDiscount);
  private shippingDiscountRepo = AppDataSource.getRepository(CouponShippingDiscount);
  private validityFixedRangeRepo = AppDataSource.getRepository(CouponValidityFixedRange);
  private validityAfterIssueDaysRepo = AppDataSource.getRepository(CouponValidityAfterIssueDays);
  private applyAllProductsRepo = AppDataSource.getRepository(CouponApplyAllProducts);
  private applyCategoryRepo = AppDataSource.getRepository(CouponApplyCategory);
  private applyExposureCategoryRepo = AppDataSource.getRepository(CouponApplyExposureCategory);
  private issueAllUsersRepo = AppDataSource.getRepository(CouponIssueAllUsers);
  private issueNewUsersRepo = AppDataSource.getRepository(CouponIssueNewUsers);
  private issueGradeRepo = AppDataSource.getRepository(CouponIssueGrade);
  private userRepo = AppDataSource.getRepository(User);

  async findAvailableCoupons(): Promise<CouponWithDetails[]> {
    const coupons = await this.couponRepo.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });

    const couponsWithDetails: CouponWithDetails[] = [];

    for (const coupon of coupons) {
      const details = await this.getCouponDetails(coupon);
      if (details && this.isValidNow(details)) {
        couponsWithDetails.push(details);
      }
    }

    return couponsWithDetails;
  }

  async findCouponById(id: number): Promise<CouponWithDetails | null> {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) return null;
    return this.getCouponDetails(coupon);
  }

  private async getCouponDetails(coupon: Coupon): Promise<CouponWithDetails | null> {
    let discountType: 'fixed' | 'rate' | 'shipping' = 'fixed';
    let discountValue = 0;
    let maxDiscountAmount: number | null = null;

    const fixedDiscount = await this.fixedDiscountRepo.findOne({ where: { couponId: coupon.id } });
    if (fixedDiscount) {
      discountType = 'fixed';
      discountValue = fixedDiscount.discountAmount;
    } else {
      const rateDiscount = await this.rateDiscountRepo.findOne({ where: { couponId: coupon.id } });
      if (rateDiscount) {
        discountType = 'rate';
        discountValue = rateDiscount.discountRate;
        maxDiscountAmount = rateDiscount.maxDiscountAmount;
      } else {
        const shippingDiscount = await this.shippingDiscountRepo.findOne({ where: { couponId: coupon.id } });
        if (shippingDiscount) {
          discountType = 'shipping';
          discountValue = shippingDiscount.isFreeShipping ? 0 : (shippingDiscount.shippingDiscountAmount || 0);
        }
      }
    }

    let validFrom: Date | null = null;
    let validTo: Date | null = null;

    const fixedRange = await this.validityFixedRangeRepo.findOne({ where: { couponId: coupon.id } });
    if (fixedRange) {
      validFrom = fixedRange.startAt;
      validTo = fixedRange.endAt;
    }

    let targetType: 'all' | 'category' = 'all';
    const applyAllProducts = await this.applyAllProductsRepo.findOne({ where: { couponId: coupon.id } });
    if (!applyAllProducts) {
      const applyCategories = await this.applyCategoryRepo.find({ where: { couponId: coupon.id } });
      const applyExposureCategories = await this.applyExposureCategoryRepo.find({ where: { couponId: coupon.id } });
      if (applyCategories.length > 0 || applyExposureCategories.length > 0) {
        targetType = 'category';
      }
    }

    return {
      ...coupon,
      discountType,
      discountValue,
      maxDiscountAmount,
      validFrom,
      validTo,
      targetType,
    };
  }

  private isValidNow(coupon: CouponWithDetails): boolean {
    if (!coupon.validFrom || !coupon.validTo) return true;
    const now = new Date();
    return coupon.validFrom <= now && coupon.validTo >= now;
  }

  async findUserCoupons(userId: string): Promise<UserCoupon[]> {
    return this.userCouponRepo
      .createQueryBuilder('uc')
      .leftJoinAndSelect('uc.coupon', 'coupon')
      .where('uc.userId = :userId', { userId })
      .andWhere('uc.status = :status', { status: 'ISSUED' })
      .andWhere('(uc.validTo IS NULL OR uc.validTo >= :now)', { now: new Date() })
      .orderBy('uc.createdAt', 'DESC')
      .getMany();
  }

  async findUserCoupon(couponId: number, userId: string): Promise<UserCoupon | null> {
    return this.userCouponRepo.findOne({
      where: { couponId, userId, status: 'ISSUED' },
    });
  }

  async findUserCouponById(userCouponId: number): Promise<UserCoupon | null> {
    return this.userCouponRepo.findOne({
      where: { id: userCouponId, status: 'ISSUED' },
    });
  }

  async createUserCoupon(couponId: number, userId: string, validFrom: Date | null, validTo: Date | null): Promise<UserCoupon> {
    const userCoupon = this.userCouponRepo.create({
      couponId,
      userId,
      status: 'ISSUED',
      issuedAt: new Date(),
      validFrom,
      validTo,
    });
    return this.userCouponRepo.save(userCoupon);
  }

  async countUserCoupons(couponId: number, userId: string): Promise<number> {
    return this.userCouponRepo.count({
      where: { couponId, userId },
    });
  }

  async canUserIssueCoupon(couponId: number, userId: string): Promise<{ canIssue: boolean; reason?: string }> {
    const issueAllUsers = await this.issueAllUsersRepo.findOne({ where: { couponId } });
    if (issueAllUsers) {
      return { canIssue: true };
    }

    const issueNewUsers = await this.issueNewUsersRepo.findOne({ where: { couponId } });
    if (issueNewUsers) {
      return { canIssue: true };
    }

    const issueGrades = await this.issueGradeRepo.find({ where: { couponId } });
    if (issueGrades.length > 0) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) {
        return { canIssue: false, reason: '사용자를 찾을 수 없습니다' };
      }
      
      const allowedGrades = issueGrades.map(g => g.grade);
      
      if (allowedGrades.includes(user.membershipGrade)) {
        return { canIssue: true };
      }
      
      return { canIssue: false, reason: '해당 등급 회원만 발급받을 수 있습니다' };
    }

    return { canIssue: false, reason: '발급 대상이 아닙니다' };
  }

  async calculateValidityDates(couponId: number): Promise<{ validFrom: Date | null; validTo: Date | null }> {
    const fixedRange = await this.validityFixedRangeRepo.findOne({ where: { couponId } });
    if (fixedRange) {
      return { validFrom: fixedRange.startAt, validTo: fixedRange.endAt };
    }

    const afterIssueDays = await this.validityAfterIssueDaysRepo.findOne({ where: { couponId } });
    if (afterIssueDays) {
      const now = new Date();
      const validTo = new Date(now);
      validTo.setDate(validTo.getDate() + afterIssueDays.validDays);
      return { validFrom: now, validTo };
    }

    return { validFrom: null, validTo: null };
  }

  async useUserCoupon(userCouponId: number, orderId: string): Promise<void> {
    await this.userCouponRepo.update(userCouponId, {
      status: 'USED',
      usedAt: new Date(),
      usedOrderId: orderId,
    });
  }

  async getUserCouponById(id: number): Promise<UserCoupon | null> {
    return this.userCouponRepo.findOne({
      where: { id },
      relations: ['coupon'],
    });
  }

  async getCouponTargetCategories(couponId: number): Promise<string[]> {
    const applyCategories = await this.applyCategoryRepo.find({
      where: { couponId },
    });
    return applyCategories.map(ac => ac.categoryId);
  }

  async getCouponTargetExposureCategories(couponId: number): Promise<number[]> {
    const applyExposureCategories = await this.applyExposureCategoryRepo.find({
      where: { couponId },
    });
    return applyExposureCategories.map(aec => Number(aec.exposureCategoryId));
  }
}
