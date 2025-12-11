import './PointBalanceCard.css';

interface PointBalanceCardProps {
  balance: number;
}

export default function PointBalanceCard({ balance }: PointBalanceCardProps) {
  const formattedBalance = balance.toLocaleString('ko-KR');

  return (
    <div className="point-balance-card">
      <span className="point-balance-card__label">포인트</span>
      <div className="point-balance-card__value-container">
        <span className="point-balance-card__value">{formattedBalance}</span>
        <span className="point-balance-card__unit">point</span>
      </div>
    </div>
  );
}
