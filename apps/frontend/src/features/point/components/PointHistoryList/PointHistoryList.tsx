import { PointHistoryGroup, PointTransaction, PointTransactionType } from '../../types/point';
import './PointHistoryList.css';

interface PointHistoryListProps {
  groups: PointHistoryGroup[];
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

function getTransactionTypeLabel(type: PointTransactionType): string {
  const labels: Record<PointTransactionType, string> = {
    earn: '적립',
    use: '사용',
    expire: '만료',
    refund: '환불',
    admin_add: '관리자 지급',
    admin_deduct: '관리자 차감',
  };
  return labels[type];
}

function getTransactionTypeClass(type: PointTransactionType): string {
  return `point-history-item__type--${type}`;
}

function formatAmount(type: PointTransactionType, amount: number): string {
  const formattedAmount = Math.abs(amount).toLocaleString('ko-KR');
  if (type === 'earn' || type === 'refund' || type === 'admin_add') {
    return `+${formattedAmount}`;
  }
  return `-${formattedAmount}`;
}

function PointHistoryItem({ transaction }: { transaction: PointTransaction }) {
  return (
    <div className="point-history-item">
      <div className="point-history-item__info">
        <span className={`point-history-item__type ${getTransactionTypeClass(transaction.type)}`}>
          {getTransactionTypeLabel(transaction.type)}
        </span>
        <span className="point-history-item__description">{transaction.description}</span>
      </div>
      <span className={`point-history-item__amount ${getTransactionTypeClass(transaction.type)}`}>
        {formatAmount(transaction.type, transaction.amount)}
      </span>
    </div>
  );
}

export default function PointHistoryList({
  groups,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: PointHistoryListProps) {
  if (groups.length === 0) {
    return (
      <div className="point-history-list">
        <div className="point-history-list__empty">
          <p className="point-history-list__empty-text">포인트 내역이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="point-history-list">
      {groups.map((group) => (
        <div key={group.date} className="point-history-group">
          <div className="point-history-group__date">{group.date}</div>
          <div className="point-history-group__items">
            {group.transactions.map((transaction) => (
              <PointHistoryItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </div>
      ))}
      
      {hasMore && (
        <button
          type="button"
          className="point-history-list__load-more"
          onClick={onLoadMore}
          disabled={isLoadingMore}
        >
          {isLoadingMore ? '불러오는 중...' : '더보기'}
        </button>
      )}
    </div>
  );
}
