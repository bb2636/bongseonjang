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
  targetCategories: string[];
  targetExposureCategories: number[];
  issueType: 'all' | 'new' | 'grade';
  issueGrades: string[];
  validityType: 'fixed' | 'afterIssue' | 'unlimited';
  validFrom: Date | null;
  validTo: Date | null;
  validDays: number | null;
  usageLimitEnabled: boolean;
  maxUsagePerUser: number | null;
  allowMultipleUse: boolean;
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
  targetCategories?: string[];
  targetExposureCategories?: number[];
  issueType: 'all' | 'new' | 'grade';
  issueGrades?: string[];
  validityType: 'fixed' | 'afterIssue' | 'unlimited';
  validFrom?: Date;
  validTo?: Date;
  validDays?: number;
  usageLimitEnabled?: boolean;
  maxUsagePerUser?: number;
  allowMultipleUse?: boolean;
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
  private applyExposureCategoryRepo = AppDataSource.getRepository(CouponApplyExposureCategory);
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
      usageLimitEnabled: data.usageLimitEnabled ?? false,
      maxUsagePerUser: data.usageLimitEnabled ? (data.maxUsagePerUser ?? null) : null,
      allowMultipleUse: data.allowMultipleUse ?? false,
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
    } else if (data.targetType === 'category') {
      if (data.targetCategories) {
        for (const categoryId of data.targetCategories) {
          await this.applyCategoryRepo.save({
            couponId: savedCoupon.id,
            categoryId,
          });
        }
      }
      if (data.targetExposureCategories) {
        for (const exposureCategoryId of data.targetExposureCategories) {
          await this.applyExposureCategoryRepo.save({
            couponId: savedCoupon.id,
            exposureCategoryId,
          });
        }
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
      for (const grade of data.issueGrades) {
        await this.issueGradeRepo.save({
          couponId: savedCoupon.id,
          grade,
        });
      }
    }

    return this.toCouponDto(savedCoupon);
  }

  async updateCoupon(id: number, data: Partial<CreateCouponDto>): Promise<AdminCouponDto | null> {
    return await AppDataSource.transaction(async (manager) => {
      const couponRepo = manager.getRepository(Coupon);
      const fixedDiscountRepo = manager.getRepository(CouponFixedDiscount);
      const rateDiscountRepo = manager.getRepository(CouponRateDiscount);
      const shippingDiscountRepo = manager.getRepository(CouponShippingDiscount);
      const validityFixedRangeRepo = manager.getRepository(CouponValidityFixedRange);
      const validityAfterIssueDaysRepo = manager.getRepository(CouponValidityAfterIssueDays);
      const applyAllProductsRepo = manager.getRepository(CouponApplyAllProducts);
      const applyCategoryRepo = manager.getRepository(CouponApplyCategory);
      const applyExposureCategoryRepo = manager.getRepository(CouponApplyExposureCategory);
      const issueAllUsersRepo = manager.getRepository(CouponIssueAllUsers);
      const issueNewUsersRepo = manager.getRepository(CouponIssueNewUsers);
      const issueGradeRepo = manager.getRepository(CouponIssueGrade);

      const coupon = await couponRepo.findOne({ where: { id } });
      if (!coupon) return null;

      if (data.name !== undefined) coupon.name = data.name;
      if (data.description !== undefined) coupon.description = data.description || null;
      if (data.minOrderAmount !== undefined) coupon.minOrderAmount = data.minOrderAmount;
      if (data.usageLimitEnabled !== undefined) {
        coupon.usageLimitEnabled = data.usageLimitEnabled;
        coupon.maxUsagePerUser = data.usageLimitEnabled ? (data.maxUsagePerUser ?? null) : null;
      }
      if (data.allowMultipleUse !== undefined) coupon.allowMultipleUse = data.allowMultipleUse;
      if (data.isActive !== undefined) coupon.isActive = data.isActive;

      await couponRepo.save(coupon);

      if (data.discountType !== undefined) {
        await fixedDiscountRepo.delete({ couponId: id });
        await rateDiscountRepo.delete({ couponId: id });
        await shippingDiscountRepo.delete({ couponId: id });

        if (data.discountType === 'fixed') {
          await fixedDiscountRepo.save({
            couponId: id,
            discountAmount: data.discountValue || 0,
          });
        } else if (data.discountType === 'rate') {
          await rateDiscountRepo.save({
            couponId: id,
            discountRate: data.discountValue || 0,
            maxDiscountAmount: data.maxDiscountAmount || null,
          });
        } else if (data.discountType === 'shipping') {
          await shippingDiscountRepo.save({
            couponId: id,
            isFreeShipping: (data.discountValue || 0) === 0,
            shippingDiscountAmount: (data.discountValue || 0) > 0 ? data.discountValue : null,
          });
        }
      }

      const shouldUpdateValidity = data.validityType !== undefined || 
        data.validFrom !== undefined || 
        data.validTo !== undefined || 
        data.validDays !== undefined;

      if (shouldUpdateValidity) {
        await validityFixedRangeRepo.delete({ couponId: id });
        await validityAfterIssueDaysRepo.delete({ couponId: id });

        const validityType = data.validityType || 'fixed';

        if (validityType === 'fixed' && data.validFrom && data.validTo) {
          await validityFixedRangeRepo.save({
            couponId: id,
            startAt: data.validFrom,
            endAt: data.validTo,
          });
        } else if (validityType === 'afterIssue' && data.validDays) {
          await validityAfterIssueDaysRepo.save({
            couponId: id,
            validDays: data.validDays,
          });
        }
      }

      if (data.targetType !== undefined) {
        await applyAllProductsRepo.delete({ couponId: id });
        await applyCategoryRepo.delete({ couponId: id });
        await applyExposureCategoryRepo.delete({ couponId: id });

        if (data.targetType === 'all') {
          await applyAllProductsRepo.save({ couponId: id });
        } else if (data.targetType === 'category') {
          if (data.targetCategories) {
            for (const categoryId of data.targetCategories) {
              await applyCategoryRepo.save({ couponId: id, categoryId });
            }
          }
          if (data.targetExposureCategories) {
            for (const exposureCategoryId of data.targetExposureCategories) {
              await applyExposureCategoryRepo.save({ couponId: id, exposureCategoryId });
            }
          }
        }
      }

      if (data.issueType !== undefined) {
        await issueAllUsersRepo.delete({ couponId: id });
        await issueNewUsersRepo.delete({ couponId: id });
        await issueGradeRepo.delete({ couponId: id });

        if (data.issueType === 'all') {
          await issueAllUsersRepo.save({ couponId: id });
        } else if (data.issueType === 'new') {
          await issueNewUsersRepo.save({ couponId: id });
        } else if (data.issueType === 'grade' && data.issueGrades) {
          for (const grade of data.issueGrades) {
            await issueGradeRepo.save({ couponId: id, grade });
          }
        }
      }

      return this.toCouponDto(coupon);
    });
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
    await this.applyExposureCategoryRepo.delete({ couponId: id });
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
    let targetCategories: string[] = [];
    let targetExposureCategories: number[] = [];
    const applyAllProducts = await this.applyAllProductsRepo.findOne({ where: { couponId: coupon.id } });
    if (!applyAllProducts) {
      const applyCategories = await this.applyCategoryRepo.find({ where: { couponId: coupon.id } });
      const applyExposureCategories = await this.applyExposureCategoryRepo.find({ where: { couponId: coupon.id } });
      if (applyCategories.length > 0 || applyExposureCategories.length > 0) {
        targetType = 'category';
        targetCategories = applyCategories.map(c => c.categoryId);
        targetExposureCategories = applyExposureCategories.map(c => Number(c.exposureCategoryId));
      }
    }

    let issueType: 'all' | 'new' | 'grade' = 'all';
    let issueGrades: string[] = [];
    const issueAllUsers = await this.issueAllUsersRepo.findOne({ where: { couponId: coupon.id } });
    if (!issueAllUsers) {
      const issueNewUsers = await this.issueNewUsersRepo.findOne({ where: { couponId: coupon.id } });
      if (issueNewUsers) {
        issueType = 'new';
      } else {
        const gradeRecords = await this.issueGradeRepo.find({ where: { couponId: coupon.id } });
        if (gradeRecords.length > 0) {
          issueType = 'grade';
          issueGrades = gradeRecords.map(g => g.grade);
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
      targetExposureCategories,
      issueType,
      issueGrades,
      validityType,
      validFrom,
      validTo,
      validDays,
      usageLimitEnabled: coupon.usageLimitEnabled ?? false,
      maxUsagePerUser: coupon.maxUsagePerUser ?? null,
      allowMultipleUse: coupon.allowMultipleUse ?? false,
      isActive: coupon.isActive,
      issuedCount,
      usedCount,
      createdAt: coupon.createdAt,
    };
  }
}
