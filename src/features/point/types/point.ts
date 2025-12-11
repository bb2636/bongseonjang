export interface PointWallet {
  id: string;
  balance: number;
  totalEarned: number;
  totalUsed: number;
  totalExpired: number;
}

export type PointTransactionType = 'earn' | 'use' | 'expire' | 'refund' | 'admin_add' | 'admin_deduct';

export interface PointTransaction {
  id: string;
  type: PointTransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  relatedOrderId: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface PointHistoryGroup {
  date: string;
  transactions: PointTransaction[];
}
