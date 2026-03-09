import { CouponRepository, CouponWithDetails } from '../repository/CouponRepository';
import { AppDataSource } from '../../../config/database.js';
import { ProductCategory } from '../../../entity/ProductCategory.js';
import { ProductExposureCategory } from '../../../entity/ProductExposureCategory.js';
import { Product } from '../../../entity/Product.js';
import { In } from 'typeorm';

const BRAND_CATEGORY_MAPPING: Record<string, string> = {
  '바담은': '바담은 제품',
  '오바다': '오바다 제품',
  '포시즌': '포시즌 제품',
  '봉쿡': '봉쿡 제품',
};

interface ProductInfo {
  productId: string;
  productCategoryId: string | null;
}

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
  allowMultipleUse: boolean;
  targetCategoryIds?: number[];
  targetExposureCategoryIds?: number[];
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

    if (coupon.usageLimitEnabled && coupon.maxUsagePerUser !== null) {
      const totalIssuedCount = await this.repository.countUserCoupons(couponId, userId);
      if (totalIssuedCount >= coupon.maxUsagePerUser) {
        return { success: false, message: `이 쿠폰은 1인당 최대 ${coupon.maxUsagePerUser}회까지 발급 가능합니다` };
      }
    } else {
      const existingCoupon = await this.repository.findUserCoupon(couponId, userId);
      if (existingCoupon) {
        return { success: false, message: '이미 발급받은 쿠폰입니다' };
      }
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

      let targetCategoryIds: number[] = [];
      let targetExposureCategoryIds: number[] = [];
      
      if (couponDetails.targetType === 'category') {
        const categoryStrings = await this.repository.getCouponTargetCategories(userCoupon.couponId);
        targetCategoryIds = categoryStrings.map(id => Number(id)).filter(id => !isNaN(id));
        targetExposureCategoryIds = await this.repository.getCouponTargetExposureCategories(userCoupon.couponId);
      }

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
        allowMultipleUse: couponDetails.allowMultipleUse,
        targetCategoryIds,
        targetExposureCategoryIds,
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
      allowMultipleUse: coupon.allowMultipleUse,
    };
  }

  async getAvailableCouponsForProducts(userId: string, productIds: string[]): Promise<CouponDto[]> {
    const allMyCoupons = await this.getMyCoupons(userId);
    
    if (productIds.length === 0) {
      return allMyCoupons;
    }

    const availableCoupons: CouponDto[] = [];

    const productRepo = AppDataSource.getRepository(Product);
    const products = await productRepo.find({
      where: { id: In(productIds) },
      select: ['id', 'productCategoryId'],
    });

    if (products.length === 0) {
      console.warn('[CouponService] No products found for IDs:', productIds);
      return allMyCoupons;
    }

    const productInfos: ProductInfo[] = products.map(p => ({
      productId: p.id,
      productCategoryId: p.productCategoryId,
    }));

    for (const coupon of allMyCoupons) {
      if (coupon.targetType === 'all') {
        availableCoupons.push(coupon);
        continue;
      }

      if (coupon.targetType === 'category') {
        const userCoupon = await this.repository.findUserCouponById(coupon.id);
        if (!userCoupon) {
          console.warn('[CouponService] UserCoupon not found for coupon.id:', coupon.id);
          continue;
        }

        const targetCategoryIds = await this.repository.getCouponTargetCategories(userCoupon.couponId);
        
        if (targetCategoryIds.length === 0) {
          availableCoupons.push(coupon);
          continue;
        }

        const targetBrandExposureNames = await this.getBrandExposureNamesForTargetCategories(targetCategoryIds);
        
        let anyProductMatches = false;
        for (const productInfo of productInfos) {
          const matches = await this.checkProductMatchesTargetCategories(
            productInfo.productId,
            productInfo.productCategoryId,
            targetCategoryIds,
            targetBrandExposureNames
          );
          if (matches) {
            anyProductMatches = true;
            break;
          }
        }

        if (anyProductMatches) {
          availableCoupons.push(coupon);
        }
      }
    }

    return availableCoupons;
  }

  private async getBrandExposureNamesForTargetCategories(targetCategoryIds: string[]): Promise<string[]> {
    const productCategoryRepo = AppDataSource.getRepository(ProductCategory);
    const targetCategories = await productCategoryRepo.find({
      where: { id: In(targetCategoryIds) },
      select: ['id', 'name'],
    });
    
    return targetCategories
      .filter(cat => BRAND_CATEGORY_MAPPING[cat.name])
      .map(cat => BRAND_CATEGORY_MAPPING[cat.name]);
  }

  private async checkProductMatchesTargetCategories(
    productId: string,
    productCategoryId: string | null,
    targetCategoryIds: string[],
    targetBrandExposureNames: string[]
  ): Promise<boolean> {
    if (productCategoryId && targetCategoryIds.includes(productCategoryId)) {
      return true;
    }
    
    if (targetBrandExposureNames.length === 0) {
      return false;
    }
    
    const pecRepo = AppDataSource.getRepository(ProductExposureCategory);
    const productExposureCategories = await pecRepo.find({
      where: { productId },
      relations: ['exposureCategory'],
    });
    
    for (const pec of productExposureCategories) {
      if (pec.exposureCategory && targetBrandExposureNames.includes(pec.exposureCategory.name)) {
        return true;
      }
    }
    
    return false;
  }
}
