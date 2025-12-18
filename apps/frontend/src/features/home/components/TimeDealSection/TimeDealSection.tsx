import { TimeDealCard } from './TimeDealCard';
import type { TimeDeal } from '../../types/timeDeal';
import './TimeDealSection.css';

interface TimeDealSectionProps {
  timeDeals: TimeDeal[];
  isLoading: boolean;
}

export default function TimeDealSection({ 
  timeDeals,
  isLoading,
}: TimeDealSectionProps) {
  if (isLoading) {
    return (
      <section className="time-deal-section">
        <h2 className="time-deal-section__title">타임특가</h2>
        <div className="time-deal-section__loading">로딩 중...</div>
      </section>
    );
  }

  if (timeDeals.length === 0) {
    return null;
  }

  return (
    <section className="time-deal-section">
      <h2 className="time-deal-section__title">타임특가</h2>
      <div className="time-deal-section__list">
        {timeDeals.map((deal) => (
          <TimeDealCard
            key={deal.id}
            deal={deal}
          />
        ))}
      </div>
    </section>
  );
}
