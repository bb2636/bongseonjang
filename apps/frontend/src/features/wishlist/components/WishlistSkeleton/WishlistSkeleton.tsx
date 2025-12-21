import { Skeleton } from '../../../../components/Skeleton';
import './WishlistSkeleton.css';

export default function WishlistSkeleton() {
  return (
    <div className="wishlist-skeleton">
      <div className="wishlist-skeleton__count">
        <Skeleton height={16} width={60} />
      </div>
      
      <div className="wishlist-skeleton__grid">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="wishlist-skeleton__card">
            <div className="wishlist-skeleton__image-wrapper">
              <Skeleton height={180} borderRadius={8} />
              <Skeleton 
                width={24} 
                height={24} 
                borderRadius="50%" 
                className="wishlist-skeleton__remove-btn" 
              />
            </div>
            <div className="wishlist-skeleton__info">
              <Skeleton height={14} width="40%" />
              <Skeleton height={16} width="80%" />
              <div className="wishlist-skeleton__price-row">
                <Skeleton height={18} width="50%" />
                <Skeleton height={32} width={32} borderRadius={8} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
