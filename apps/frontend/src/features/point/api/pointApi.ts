import { PointWallet, PointTransaction } from '../types/point';
import { API_BASE_URL } from '../../../shared/config/apiConfig';

export async function fetchPointWallet(): Promise<PointWallet> {
  const response = await fetch(`${API_BASE_URL}/points/wallet`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
    },
  });

  if (!response.ok) {
    throw new Error('포인트 정보를 불러오는데 실패했습니다.');
  }

  return response.json();
}

export async function fetchPointTransactions(
  page: number = 1,
  limit: number = 20
): Promise<{ transactions: PointTransaction[]; total: number; hasMore: boolean }> {
  const response = await fetch(
    `${API_BASE_URL}/points/transactions?page=${page}&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('포인트 내역을 불러오는데 실패했습니다.');
  }

  return response.json();
}
