import { Skeleton } from '../Skeleton/Skeleton';
import './HomePageSkeleton.css';

export function HomePageSkeleton() {
  return (
    <div className="home-skeleton">
      <header className="home-skeleton__header">
        <Skeleton width={120} height={32} borderRadius={4} />
        <div className="home-skeleton__header-icons">
          <Skeleton width={24} height={24} variant="circular" />
          <Skeleton width={24} height={24} variant="circular" />
        </div>
      </header>

      <div className="home-skeleton__hero">
        <Skeleton height={200} borderRadius={0} />
      </div>

      <div className="home-skeleton__section">
        <Skeleton width={120} height={20} />
        <div className="home-skeleton__product-row">
          {[1, 2, 3].map((i) => (
            <div key={i} className="home-skeleton__product-card">
              <Skeleton height={120} borderRadius={8} />
              <Skeleton width="80%" height={14} />
              <Skeleton width="50%" height={16} />
            </div>
          ))}
        </div>
      </div>

      <div className="home-skeleton__section">
        <Skeleton width={100} height={20} />
        <div className="home-skeleton__product-row">
          {[1, 2, 3].map((i) => (
            <div key={i} className="home-skeleton__product-card">
              <Skeleton height={120} borderRadius={8} />
              <Skeleton width="80%" height={14} />
              <Skeleton width="50%" height={16} />
            </div>
          ))}
        </div>
      </div>

      <nav className="home-skeleton__nav">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} width={40} height={40} variant="circular" />
        ))}
      </nav>
    </div>
  );
}

export default HomePageSkeleton;
