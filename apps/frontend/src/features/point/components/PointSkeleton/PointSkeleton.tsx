import { Skeleton } from '../../../../components/Skeleton';
import './PointSkeleton.css';

export default function PointSkeleton() {
  return (
    <div className="point-skeleton">
      <div className="point-skeleton__balance-card">
        <Skeleton height={14} width={60} />
        <Skeleton height={32} width={150} />
      </div>

      <div className="point-skeleton__divider" />

      <div className="point-skeleton__history">
        <div className="point-skeleton__date-group">
          <Skeleton height={14} width={100} className="point-skeleton__date" />
          
          {[1, 2, 3].map((item) => (
            <div key={item} className="point-skeleton__item">
              <div className="point-skeleton__item-left">
                <Skeleton height={16} width={140} />
                <Skeleton height={12} width={60} />
              </div>
              <div className="point-skeleton__item-right">
                <Skeleton height={18} width={80} />
              </div>
            </div>
          ))}
        </div>

        <div className="point-skeleton__date-group">
          <Skeleton height={14} width={100} className="point-skeleton__date" />
          
          {[1, 2].map((item) => (
            <div key={item} className="point-skeleton__item">
              <div className="point-skeleton__item-left">
                <Skeleton height={16} width={120} />
                <Skeleton height={12} width={50} />
              </div>
              <div className="point-skeleton__item-right">
                <Skeleton height={18} width={70} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
