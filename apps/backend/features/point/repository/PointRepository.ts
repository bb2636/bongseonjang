import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/database';
import { PointWallet, PointTransaction } from '../../../entity';

export interface TransactionFilter {
  page?: number;
  limit?: number;
}

export class PointRepository {
  private walletRepository: Repository<PointWallet>;
  private transactionRepository: Repository<PointTransaction>;

  constructor() {
    this.walletRepository = AppDataSource.getRepository(PointWallet);
    this.transactionRepository = AppDataSource.getRepository(PointTransaction);
  }

  async findWalletByUserId(userId: string): Promise<PointWallet | null> {
    return this.walletRepository.findOne({
      where: { userId },
    });
  }

  async createWallet(userId: string): Promise<PointWallet> {
    const wallet = this.walletRepository.create({ userId });
    return this.walletRepository.save(wallet);
  }

  async getOrCreateWallet(userId: string): Promise<PointWallet> {
    let wallet = await this.findWalletByUserId(userId);
    if (!wallet) {
      wallet = await this.createWallet(userId);
    }
    return wallet;
  }

  async findTransactionsByWalletId(
    walletId: string,
    filter: TransactionFilter = {}
  ): Promise<{ transactions: PointTransaction[]; total: number }> {
    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const skip = (page - 1) * limit;

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: { walletId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { transactions, total };
  }

  async addPoints(
    walletId: string,
    amount: number,
    description: string,
    relatedOrderId?: string,
    expiresAt?: Date
  ): Promise<PointTransaction> {
    const wallet = await this.walletRepository.findOne({ where: { id: walletId } });
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const newBalance = wallet.balance + amount;
    
    await this.walletRepository.update(walletId, {
      balance: newBalance,
      totalEarned: wallet.totalEarned + amount,
    });

    const transaction = this.transactionRepository.create({
      walletId,
      type: 'earn',
      amount,
      balanceAfter: newBalance,
      description,
      relatedOrderId,
      expiresAt,
    });

    return this.transactionRepository.save(transaction);
  }

  async usePoints(
    walletId: string,
    amount: number,
    description: string,
    relatedOrderId?: string
  ): Promise<PointTransaction> {
    if (relatedOrderId) {
      const existingTransaction = await this.transactionRepository.findOne({
        where: { relatedOrderId, type: 'use' },
      });
      if (existingTransaction) {
        console.log('[PointRepository] Points already deducted for order:', relatedOrderId);
        return existingTransaction;
      }
    }

    const wallet = await this.walletRepository.findOne({ where: { id: walletId } });
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    if (wallet.balance < amount) {
      throw new Error('Insufficient points');
    }

    const newBalance = wallet.balance - amount;
    
    await this.walletRepository.update(walletId, {
      balance: newBalance,
      totalUsed: wallet.totalUsed + amount,
    });

    const transaction = this.transactionRepository.create({
      walletId,
      type: 'use',
      amount,
      balanceAfter: newBalance,
      description,
      relatedOrderId,
    });

    return this.transactionRepository.save(transaction);
  }

  async cancelPoints(
    walletId: string,
    amount: number,
    description: string,
    relatedOrderId?: string
  ): Promise<PointTransaction> {
    const wallet = await this.walletRepository.findOne({ where: { id: walletId } });
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const newBalance = wallet.balance + amount;
    
    await this.walletRepository.update(walletId, {
      balance: newBalance,
      totalUsed: wallet.totalUsed - amount,
    });

    const transaction = this.transactionRepository.create({
      walletId,
      type: 'refund',
      amount,
      balanceAfter: newBalance,
      description,
      relatedOrderId,
    });

    return this.transactionRepository.save(transaction);
  }
}
