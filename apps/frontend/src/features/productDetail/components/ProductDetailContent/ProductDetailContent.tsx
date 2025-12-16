import { useState } from 'react';
import './ProductDetailContent.css';

interface ProductDetailContentProps {
  images: { id: string; imageUrl: string; sortOrder: number }[];
}

const COLLAPSED_HEIGHT = 400;

export default function ProductDetailContent({ images }: ProductDetailContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (images.length === 0) {
    return null;
  }

  const sortedImages = [...images].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleExpandClick = () => {
    setIsExpanded(true);
  };

  return (
    <div className="product-detail-content">
      <div 
        className={`product-detail-content__wrapper ${isExpanded ? 'product-detail-content__wrapper--expanded' : ''}`}
        style={!isExpanded ? { maxHeight: `${COLLAPSED_HEIGHT}px` } : undefined}
      >
        <div className="product-detail-content__images">
          {sortedImages.map((image) => (
            <img
              key={image.id}
              src={image.imageUrl}
              alt="상품 상세 이미지"
              className="product-detail-content__image"
            />
          ))}
        </div>
      </div>
      
      {!isExpanded && (
        <div className="product-detail-content__gradient">
          <button 
            type="button"
            className="product-detail-content__expand-button"
            onClick={handleExpandClick}
          >
            더보기
          </button>
        </div>
      )}
    </div>
  );
}
