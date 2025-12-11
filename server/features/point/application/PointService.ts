import { PointRepository, TransactionFilter } from '../repository/PointRepository';

export interface PointWalletDto {
  id: string;
  balance: number;
  totalEarned: number;
  totalUsed: number;
  totalExpired: number;
}

export interface PointTransactionDto {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  relatedOrderId: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface PointTransactionsResponse {
  transactions: PointTransactionDto[];
  total: number;
  hasMore: boolean;
}

export class PointService {
  constructor(private readonly pointRepository: PointRepository) {}

  async getWallet(userId: string): Promise<PointWalletDto> {
    const wallet = await this.pointRepository.getOrCreateWallet(userId);
    return {
      id: wallet.id,
      balance: wallet.balance,
      totalEarned: wallet.totalEarned,
      totalUsed: wallet.totalUsed,
      totalExpired: wallet.totalExpired,
    };
  }

  async getTransactions(
    userId: string,
    filter: TransactionFilter = {}
  ): Promise<PointTransactionsResponse> {
    const wallet = await this.pointRepository.getOrCreateWallet(userId);
    const page = filter.page || 1;
    const limit = filter.limit || 20;
    
    const { transactions, total } = await this.pointRepository.findTransactionsByWalletId(
      wallet.id,
      { page, limit }
    );

    const hasMore = page * limit < total;

    return {
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        balanceAfter: t.balanceAfter,
        description: t.description,
        relatedOrderId: t.relatedOrderId || null,
        expiresAt: t.expiresAt ? t.expiresAt.toISOString() : null,
        createdAt: t.createdAt.toISOString(),
      })),
      total,
      hasMore,
    };
  }

  async addPoints(
    userId: string,
    amount: number,
    description: string,
    relatedOrderId?: string,
    expiresAt?: Date
  ): Promise<PointTransactionDto> {
    const wallet = await this.pointRepository.getOrCreateWallet(userId);
    const transaction = await this.pointRepository.addPoints(
      wallet.id,
      amount,
      description,
      relatedOrderId,
      expiresAt
    );

    return {
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      balanceAfter: transaction.balanceAfter,
      description: transaction.description,
      relatedOrderId: transaction.relatedOrderId || null,
      expiresAt: transaction.expiresAt ? transaction.expiresAt.toISOString() : null,
      createdAt: transaction.createdAt.toISOString(),
    };
  }

  async usePoints(
    userId: string,
    amount: number,
    description: string,
    relatedOrderId?: string
  ): Promise<PointTransactionDto> {
    const wallet = await this.pointRepository.getOrCreateWallet(userId);
    const transaction = await this.pointRepository.usePoints(
      wallet.id,
      amount,
      description,
      relatedOrderId
    );

    return {
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      balanceAfter: transaction.balanceAfter,
      description: transaction.description,
      relatedOrderId: transaction.relatedOrderId || null,
      expiresAt: null,
      createdAt: transaction.createdAt.toISOString(),
    };
  }
}
