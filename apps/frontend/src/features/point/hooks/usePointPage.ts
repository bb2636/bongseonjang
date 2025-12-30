import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PointWallet, PointTransaction, PointHistoryGroup } from '../types/point';
import { fetchPointWallet, fetchPointTransactions } from '../api/pointApi';
import { useGoBack } from '../../../hooks/useGoBack';

function groupTransactionsByDate(transactions: PointTransaction[]): PointHistoryGroup[] {
  const groups: Map<string, PointTransaction[]> = new Map();

  transactions.forEach((transaction) => {
    const date = new Date(transaction.createdAt).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\. /g, '.').replace(/\.$/, '');

    const existing = groups.get(date) || [];
    existing.push(transaction);
    groups.set(date, existing);
  });

  return Array.from(groups.entries()).map(([date, transactions]) => ({
    date,
    transactions,
  }));
}

export function usePointPage() {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [wallet, setWallet] = useState<PointWallet | null>(null);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [historyGroups, setHistoryGroups] = useState<PointHistoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    async function loadPointData() {
      setIsLoading(true);
      setError(null);
      try {
        const [walletData, transactionsData] = await Promise.all([
          fetchPointWallet(),
          fetchPointTransactions(1, 20),
        ]);
        setWallet(walletData);
        setTransactions(transactionsData.transactions);
        setHistoryGroups(groupTransactionsByDate(transactionsData.transactions));
        setHasMore(transactionsData.hasMore);
      } catch (err) {
        console.error('Failed to load point data:', err);
        setError('포인트 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
    loadPointData();
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const transactionsData = await fetchPointTransactions(nextPage, 20);
      const newTransactions = [...transactions, ...transactionsData.transactions].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setTransactions(newTransactions);
      setHistoryGroups(groupTransactionsByDate(newTransactions));
      setPage(nextPage);
      setHasMore(transactionsData.hasMore);
    } catch (err) {
      console.error('Failed to load more transactions:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, page, transactions]);

  const handleBackClick = useCallback(() => {
    goBack();
  }, [goBack]);

  const handleCartClick = useCallback(() => {
    navigate('/cart');
  }, [navigate]);

  return {
    state: {
      wallet,
      historyGroups,
      isLoading,
      error,
      hasMore,
      isLoadingMore,
    },
    actions: {
      onBackClick: handleBackClick,
      onCartClick: handleCartClick,
      onLoadMore: handleLoadMore,
    },
  };
}
