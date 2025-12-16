import { ShippingAddressRepository, CreateShippingAddressData, UpdateShippingAddressData } from './ShippingAddressRepository';
import { ShippingAddress } from '../../../entity/ShippingAddress';
import { AppDataSource } from '../../../config/database';

export class RealShippingAddressRepository implements ShippingAddressRepository {
  private getRepository() {
    return AppDataSource.getRepository(ShippingAddress);
  }

  async findByUserId(userId: string): Promise<ShippingAddress[]> {
    return this.getRepository().find({
      where: { userId, isDeleted: false },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findById(id: string, userId: string): Promise<ShippingAddress | null> {
    return this.getRepository().findOne({
      where: { id, userId, isDeleted: false },
    });
  }

  async findDefaultByUserId(userId: string): Promise<ShippingAddress | null> {
    return this.getRepository().findOne({
      where: { userId, isDefault: true, isDeleted: false },
    });
  }

  async create(data: CreateShippingAddressData): Promise<ShippingAddress> {
    const repository = this.getRepository();

    if (data.isDefault) {
      await this.clearDefaultAddress(data.userId);
    }

    const address = repository.create({
      ...data,
      isDeleted: false,
      deletedAt: null,
    });

    return repository.save(address);
  }

  async update(id: string, userId: string, data: UpdateShippingAddressData): Promise<ShippingAddress | null> {
    const repository = this.getRepository();

    const address = await this.findById(id, userId);
    if (!address) {
      return null;
    }

    if (data.isDefault === true && !address.isDefault) {
      await this.clearDefaultAddress(userId);
    }

    Object.assign(address, data);
    return repository.save(address);
  }

  async softDelete(id: string, userId: string): Promise<boolean> {
    const repository = this.getRepository();

    const address = await this.findById(id, userId);
    if (!address) {
      return false;
    }

    address.isDeleted = true;
    address.deletedAt = new Date();
    address.isDefault = false;
    await repository.save(address);

    return true;
  }

  async setDefault(id: string, userId: string): Promise<boolean> {
    const targetAddress = await this.findById(id, userId);
    if (!targetAddress) {
      return false;
    }

    if (targetAddress.isDefault) {
      return true;
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(
        ShippingAddress,
        { userId, isDefault: true, isDeleted: false },
        { isDefault: false }
      );

      const result = await queryRunner.manager.update(
        ShippingAddress,
        { id, userId, isDeleted: false },
        { isDefault: true }
      );

      if ((result.affected ?? 0) === 0) {
        await queryRunner.rollbackTransaction();
        return false;
      }

      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async clearDefaultAddress(userId: string): Promise<void> {
    await this.getRepository().update(
      { userId, isDefault: true, isDeleted: false },
      { isDefault: false }
    );
  }
}
