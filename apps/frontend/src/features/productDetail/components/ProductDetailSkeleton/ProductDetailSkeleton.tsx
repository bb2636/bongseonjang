import { Skeleton, SkeletonText } from '../../../../components/Skeleton';
import './ProductDetailSkeleton.css';

export default function ProductDetailSkeleton() {
  return (
    <div className="product-detail-skeleton">
      <div className="product-detail-skeleton__header">
        <Skeleton width={24} height={24} borderRadius={4} />
        <Skeleton width={24} height={24} borderRadius={4} />
      </div>

      <Skeleton 
        height={375} 
        width="100%" 
        borderRadius={0} 
        className="product-detail-skeleton__image"
      />

      <div className="product-detail-skeleton__content">
        <div className="product-detail-skeleton__brand">
          <Skeleton height={14} width={80} />
        </div>

        <div className="product-detail-skeleton__title">
          <SkeletonText lines={2} lineHeight={20} gap={6} lastLineWidth="60%" />
        </div>

        <div className="product-detail-skeleton__price">
          <Skeleton height={28} width={120} />
          <Skeleton height={14} width={80} />
        </div>

        <div className="product-detail-skeleton__rating">
          <Skeleton height={16} width={100} />
        </div>

        <div className="product-detail-skeleton__divider" />

        <div className="product-detail-skeleton__options">
          <Skeleton height={14} width={60} />
          <Skeleton height={48} width="100%" borderRadius={8} />
        </div>

        <div className="product-detail-skeleton__quantity">
          <Skeleton height={14} width={40} />
          <Skeleton height={40} width={120} borderRadius={8} />
        </div>

        <div className="product-detail-skeleton__divider" />

        <div className="product-detail-skeleton__tabs">
          <Skeleton height={44} width="25%" />
          <Skeleton height={44} width="25%" />
          <Skeleton height={44} width="25%" />
          <Skeleton height={44} width="25%" />
        </div>

        <div className="product-detail-skeleton__description">
          <SkeletonText lines={5} lineHeight={16} gap={8} lastLineWidth="40%" />
        </div>
      </div>

      <div className="product-detail-skeleton__bottom-bar">
        <Skeleton width={48} height={48} borderRadius={8} />
        <Skeleton height={48} borderRadius={8} className="product-detail-skeleton__buy-button" />
      </div>
    </div>
  );
}
