export type PointTransactionType = 
  | 'EARN_PURCHASE'
  | 'EARN_REVIEW'
  | 'EARN_SIGNUP'
  | 'EARN_REFERRAL'
  | 'EARN_EVENT'
  | 'USE_PURCHASE'
  | 'REFUND'
  | 'EXPIRE'
  | 'ADMIN_ADJUST';

export interface PointWalletDto {
  userId: string;
  balance: number;
  totalEarned: number;
  totalUsed: number;
  expiringPoints: number;
  expiringDate: string | null;
}

export interface PointTransactionDto {
  id: string;
  type: PointTransactionType;
  amount: number;
  balance: number;
  description: string;
  orderId: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface PointHistoryRequest {
  page?: number;
  limit?: number;
  type?: 'earn' | 'use' | 'all';
  startDate?: string;
  endDate?: string;
}

export interface PointHistoryResponse {
  wallet: PointWalletDto;
  transactions: PointTransactionDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface UsePointsRequest {
  orderId: string;
  amount: number;
}

export interface UsePointsResponse {
  success: boolean;
  usedAmount: number;
  remainingBalance: number;
  message?: string;
}
