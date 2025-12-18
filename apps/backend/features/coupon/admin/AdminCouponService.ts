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
import { CouponIssueAllUsers } from '../../../entity/CouponIssueAllUsers';
import { CouponIssueNewUsers } from '../../../entity/CouponIssueNewUsers';
import { CouponIssueGrade } from '../../../entity/CouponIssueGrade';
import { Like, In } from 'typeorm';

export interface AdminCouponDto {
  id: number;
  name: string;
  description: string | null;
  discountType: 'fixed' | 'rate' | 'shipping';
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number;
  targetType: 'all' | 'category';
  targetCategories: number[];
  issueType: 'all' | 'new' | 'grade';
  issueGrades: number[];
  validityType: 'fixed' | 'afterIssue' | 'unlimited';
  validFrom: Date | null;
  validTo: Date | null;
  validDays: number | null;
  isActive: boolean;
  issuedCount: number;
  usedCount: number;
  createdAt: Date;
}

export interface CreateCouponDto {
  name: string;
  description?: string;
  discountType: 'fixed' | 'rate' | 'shipping';
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  targetType: 'all' | 'category';
  targetCategories?: number[];
  issueType: 'all' | 'new' | 'grade';
  issueGrades?: number[];
  validityType: 'fixed' | 'afterIssue' | 'unlimited';
  validFrom?: Date;
  validTo?: Date;
  validDays?: number;
  isActive?: boolean;
}

interface GetCouponsParams {
  search?: string;
  discountType?: string;
  page: number;
  limit: number;
}

interface CouponListResponse {
  coupons: AdminCouponDto[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class AdminCouponService {
  private couponRepo = AppDataSource.getRepository(Coupon);
  private userCouponRepo = AppDataSource.getRepository(UserCoupon);
  private fixedDiscountRepo = AppDataSource.getRepository(CouponFixedDiscount);
  private rateDiscountRepo = AppDataSource.getRepository(CouponRateDiscount);
  private shippingDiscountRepo = AppDataSource.getRepository(CouponShippingDiscount);
  private validityFixedRangeRepo = AppDataSource.getRepository(CouponValidityFixedRange);
  private validityAfterIssueDaysRepo = AppDataSource.getRepository(CouponValidityAfterIssueDays);
  private applyAllProductsRepo = AppDataSource.getRepository(CouponApplyAllProducts);
  private applyCategoryRepo = AppDataSource.getRepository(CouponApplyCategory);
  private issueAllUsersRepo = AppDataSource.getRepository(CouponIssueAllUsers);
  private issueNewUsersRepo = AppDataSource.getRepository(CouponIssueNewUsers);
  private issueGradeRepo = AppDataSource.getRepository(CouponIssueGrade);

  async getCoupons(params: GetCouponsParams): Promise<CouponListResponse> {
    const { search, discountType, page, limit } = params;
    const skip = (page - 1) * limit;

    const queryBuilder = this.couponRepo.createQueryBuilder('coupon');

    if (search) {
      queryBuilder.andWhere('coupon.name LIKE :search', { search: `%${search}%` });
    }

    queryBuilder.orderBy('coupon.createdAt', 'DESC');
    queryBuilder.skip(skip);
    queryBuilder.take(limit);

    const [coupons, totalCount] = await queryBuilder.getManyAndCount();

    let filteredCoupons = await Promise.all(
      coupons.map(async (coupon) => this.toCouponDto(coupon))
    );

    if (discountType && discountType !== 'all') {
      filteredCoupons = filteredCoupons.filter(c => c.discountType === discountType);
    }

    return {
      coupons: filteredCoupons,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async getCouponById(id: number): Promise<AdminCouponDto | null> {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) return null;
    return this.toCouponDto(coupon);
  }

  async createCoupon(data: CreateCouponDto): Promise<AdminCouponDto> {
    const coupon = this.couponRepo.create({
      name: data.name,
      description: data.description || null,
      minOrderAmount: data.minOrderAmount || 0,
      isActive: data.isActive ?? true,
    });

    const savedCoupon = await this.couponRepo.save(coupon);

    if (data.discountType === 'fixed') {
      await this.fixedDiscountRepo.save({
        couponId: savedCoupon.id,
        discountAmount: data.discountValue,
      });
    } else if (data.discountType === 'rate') {
      await this.rateDiscountRepo.save({
        couponId: savedCoupon.id,
        discountRate: data.discountValue,
        maxDiscountAmount: data.maxDiscountAmount || null,
      });
    } else if (data.discountType === 'shipping') {
      await this.shippingDiscountRepo.save({
        couponId: savedCoupon.id,
        isFreeShipping: data.discountValue === 0,
        shippingDiscountAmount: data.discountValue > 0 ? data.discountValue : null,
      });
    }

    if (data.validityType === 'fixed' && data.validFrom && data.validTo) {
      await this.validityFixedRangeRepo.save({
        couponId: savedCoupon.id,
        startAt: data.validFrom,
        endAt: data.validTo,
      });
    } else if (data.validityType === 'afterIssue' && data.validDays) {
      await this.validityAfterIssueDaysRepo.save({
        couponId: savedCoupon.id,
        validDays: data.validDays,
      });
    }

    if (data.targetType === 'all') {
      await this.applyAllProductsRepo.save({
        couponId: savedCoupon.id,
      });
    } else if (data.targetType === 'category' && data.targetCategories) {
      for (const categoryId of data.targetCategories) {
        await this.applyCategoryRepo.save({
          couponId: savedCoupon.id,
          categoryId,
        });
      }
    }

    if (data.issueType === 'all') {
      await this.issueAllUsersRepo.save({
        couponId: savedCoupon.id,
      });
    } else if (data.issueType === 'new') {
      await this.issueNewUsersRepo.save({
        couponId: savedCoupon.id,
      });
    } else if (data.issueType === 'grade' && data.issueGrades) {
      for (const gradeId of data.issueGrades) {
        await this.issueGradeRepo.save({
          couponId: savedCoupon.id,
          gradeId,
        });
      }
    }

    return this.toCouponDto(savedCoupon);
  }

  async updateCoupon(id: number, data: Partial<CreateCouponDto>): Promise<AdminCouponDto | null> {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) return null;

    if (data.name !== undefined) coupon.name = data.name;
    if (data.description !== undefined) coupon.description = data.description || null;
    if (data.minOrderAmount !== undefined) coupon.minOrderAmount = data.minOrderAmount;
    if (data.isActive !== undefined) coupon.isActive = data.isActive;

    await this.couponRepo.save(coupon);

    return this.toCouponDto(coupon);
  }

  async deleteCoupon(id: number): Promise<boolean> {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) return false;

    await this.fixedDiscountRepo.delete({ couponId: id });
    await this.rateDiscountRepo.delete({ couponId: id });
    await this.shippingDiscountRepo.delete({ couponId: id });
    await this.validityFixedRangeRepo.delete({ couponId: id });
    await this.validityAfterIssueDaysRepo.delete({ couponId: id });
    await this.applyAllProductsRepo.delete({ couponId: id });
    await this.applyCategoryRepo.delete({ couponId: id });
    await this.issueAllUsersRepo.delete({ couponId: id });
    await this.issueNewUsersRepo.delete({ couponId: id });
    await this.issueGradeRepo.delete({ couponId: id });

    await this.couponRepo.delete({ id });

    return true;
  }

  async toggleCouponStatus(id: number): Promise<AdminCouponDto | null> {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) return null;

    coupon.isActive = !coupon.isActive;
    await this.couponRepo.save(coupon);

    return this.toCouponDto(coupon);
  }

  private async toCouponDto(coupon: Coupon): Promise<AdminCouponDto> {
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

    let targetType: 'all' | 'category' = 'all';
    let targetCategories: number[] = [];
    const applyAllProducts = await this.applyAllProductsRepo.findOne({ where: { couponId: coupon.id } });
    if (!applyAllProducts) {
      const applyCategories = await this.applyCategoryRepo.find({ where: { couponId: coupon.id } });
      if (applyCategories.length > 0) {
        targetType = 'category';
        targetCategories = applyCategories.map(c => c.categoryId);
      }
    }

    let issueType: 'all' | 'new' | 'grade' = 'all';
    let issueGrades: number[] = [];
    const issueAllUsers = await this.issueAllUsersRepo.findOne({ where: { couponId: coupon.id } });
    if (!issueAllUsers) {
      const issueNewUsers = await this.issueNewUsersRepo.findOne({ where: { couponId: coupon.id } });
      if (issueNewUsers) {
        issueType = 'new';
      } else {
        const gradeRecords = await this.issueGradeRepo.find({ where: { couponId: coupon.id } });
        if (gradeRecords.length > 0) {
          issueType = 'grade';
          issueGrades = gradeRecords.map(g => g.gradeId);
        }
      }
    }

    let validityType: 'fixed' | 'afterIssue' | 'unlimited' = 'unlimited';
    let validFrom: Date | null = null;
    let validTo: Date | null = null;
    let validDays: number | null = null;

    const fixedRange = await this.validityFixedRangeRepo.findOne({ where: { couponId: coupon.id } });
    if (fixedRange) {
      validityType = 'fixed';
      validFrom = fixedRange.startAt;
      validTo = fixedRange.endAt;
    } else {
      const afterIssueDays = await this.validityAfterIssueDaysRepo.findOne({ where: { couponId: coupon.id } });
      if (afterIssueDays) {
        validityType = 'afterIssue';
        validDays = afterIssueDays.validDays;
      }
    }

    const issuedCount = await this.userCouponRepo.count({ where: { couponId: coupon.id } });
    const usedCount = await this.userCouponRepo.count({ where: { couponId: coupon.id, status: 'USED' } });

    return {
      id: coupon.id,
      name: coupon.name,
      description: coupon.description,
      discountType,
      discountValue,
      maxDiscountAmount,
      minOrderAmount: coupon.minOrderAmount,
      targetType,
      targetCategories,
      issueType,
      issueGrades,
      validityType,
      validFrom,
      validTo,
      validDays,
      isActive: coupon.isActive,
      issuedCount,
      usedCount,
      createdAt: coupon.createdAt,
    };
  }
}
