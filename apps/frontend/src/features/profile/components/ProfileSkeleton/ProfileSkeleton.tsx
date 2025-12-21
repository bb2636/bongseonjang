import { Skeleton } from '../../../../components/Skeleton';
import './ProfileSkeleton.css';

export default function ProfileSkeleton() {
  return (
    <div className="profile-skeleton">
      <div className="profile-skeleton__header">
        <div className="profile-skeleton__user-info">
          <Skeleton height={24} width={100} />
          <Skeleton height={14} width={60} />
        </div>
        <Skeleton width={32} height={32} borderRadius={8} />
      </div>

      <div className="profile-skeleton__summary">
        <div className="profile-skeleton__summary-item">
          <Skeleton height={24} width={60} />
          <Skeleton height={12} width={40} />
        </div>
        <div className="profile-skeleton__summary-item">
          <Skeleton height={24} width={40} />
          <Skeleton height={12} width={30} />
        </div>
        <div className="profile-skeleton__summary-item">
          <Skeleton height={24} width={40} />
          <Skeleton height={12} width={30} />
        </div>
        <div className="profile-skeleton__summary-item">
          <Skeleton height={24} width={40} />
          <Skeleton height={12} width={50} />
        </div>
      </div>

      <div className="profile-skeleton__orders">
        <div className="profile-skeleton__section-header">
          <Skeleton height={18} width={100} />
          <Skeleton height={14} width={60} />
        </div>
        
        {[1, 2].map((item) => (
          <div key={item} className="profile-skeleton__order-card">
            <div className="profile-skeleton__order-header">
              <Skeleton height={14} width={80} />
              <Skeleton height={14} width={60} />
            </div>
            <div className="profile-skeleton__order-content">
              <Skeleton width={60} height={60} borderRadius={8} />
              <div className="profile-skeleton__order-info">
                <Skeleton height={16} width="80%" />
                <Skeleton height={14} width="50%" />
              </div>
            </div>
            <div className="profile-skeleton__order-actions">
              <Skeleton height={36} borderRadius={8} />
              <Skeleton height={36} borderRadius={8} />
            </div>
          </div>
        ))}
      </div>

      <div className="profile-skeleton__divider" />

      <div className="profile-skeleton__menu">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="profile-skeleton__menu-item">
            <Skeleton height={16} width={120} />
          </div>
        ))}
      </div>
    </div>
  );
}
