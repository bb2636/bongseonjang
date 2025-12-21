import type { CSSProperties } from 'react';
import './Skeleton.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export function Skeleton({
  width = '100%',
  height = '16px',
  borderRadius,
  className = '',
  variant = 'rectangular',
}: SkeletonProps) {
  const style: CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: variant === 'circular' 
      ? '50%' 
      : borderRadius 
        ? typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius
        : variant === 'text' ? '4px' : '8px',
  };

  return (
    <div 
      className={`skeleton skeleton--${variant} ${className}`}
      style={style}
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  lineHeight?: number;
  gap?: number;
  lastLineWidth?: string;
  className?: string;
}

export function SkeletonText({
  lines = 1,
  lineHeight = 16,
  gap = 8,
  lastLineWidth = '70%',
  className = '',
}: SkeletonTextProps) {
  return (
    <div className={`skeleton-text ${className}`} style={{ gap: `${gap}px` }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          height={lineHeight}
          width={index === lines - 1 && lines > 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  imageHeight?: number;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showPrice?: boolean;
  className?: string;
}

export function SkeletonCard({
  imageHeight = 180,
  showTitle = true,
  showSubtitle = true,
  showPrice = true,
  className = '',
}: SkeletonCardProps) {
  return (
    <div className={`skeleton-card ${className}`}>
      <Skeleton height={imageHeight} borderRadius={8} />
      <div className="skeleton-card__content">
        {showTitle && <Skeleton height={18} width="80%" />}
        {showSubtitle && <Skeleton height={14} width="60%" />}
        {showPrice && <Skeleton height={20} width="50%" />}
      </div>
    </div>
  );
}

export default Skeleton;
