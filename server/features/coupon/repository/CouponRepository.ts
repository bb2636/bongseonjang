import { AppDataSource } from '../../../config/database';
import { Coupon } from '../../../entity/Coupon';
import { CouponIssuance } from '../../../entity/CouponIssuance';
import { MoreThanOrEqual, LessThanOrEqual } from 'typeorm';

export class CouponRepository {
  private couponRepo = AppDataSource.getRepository(Coupon);
  private issuanceRepo = AppDataSource.getRepository(CouponIssuance);

  async findAvailableCoupons(): Promise<Coupon[]> {
    const now = new Date();
    return this.couponRepo.find({
      where: {
        isActive: true,
        validFrom: LessThanOrEqual(now),
        validTo: MoreThanOrEqual(now),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findCouponById(id: string): Promise<Coupon | null> {
    return this.couponRepo.findOne({ where: { id } });
  }

  async findUserIssuances(userId: string): Promise<CouponIssuance[]> {
    return this.issuanceRepo.find({
      where: { userId },
      relations: ['coupon'],
      order: { createdAt: 'DESC' },
    });
  }

  async findIssuance(couponId: string, userId: string): Promise<CouponIssuance | null> {
    return this.issuanceRepo.findOne({
      where: { couponId, userId },
    });
  }

  async createIssuance(couponId: string, userId: string, expiresAt: Date): Promise<CouponIssuance> {
    const issuance = this.issuanceRepo.create({
      couponId,
      userId,
      expiresAt,
    });
    return this.issuanceRepo.save(issuance);
  }

  async countUserIssuances(couponId: string, userId: string): Promise<number> {
    return this.issuanceRepo.count({
      where: { couponId, userId },
    });
  }

  async incrementUsedQuantity(couponId: string): Promise<void> {
    await this.couponRepo.increment({ id: couponId }, 'usedQuantity', 1);
  }
}
