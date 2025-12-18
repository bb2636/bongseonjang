import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import './ProductImageSlider.css';

interface ProductImageSliderProps {
  images: { id: string; imageUrl: string }[];
  thumbnailUrl?: string;
}

const FALLBACK_IMAGE = 'https://placehold.co/375x375/f5f5f5/999999?text=No+Image';

export default function ProductImageSlider({ images, thumbnailUrl }: ProductImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayImages = images.length > 0 
    ? images.map(img => img.imageUrl)
    : thumbnailUrl 
      ? [thumbnailUrl]
      : [FALLBACK_IMAGE];

  const handleSlideChange = (swiper: SwiperType) => {
    setCurrentIndex(swiper.activeIndex);
  };

  return (
    <div className="product-image-slider">
      <Swiper
        spaceBetween={0}
        slidesPerView={1}
        onSlideChange={handleSlideChange}
        className="product-image-slider__swiper"
      >
        {displayImages.map((imageUrl, index) => (
          <SwiperSlide key={index}>
            <img
              src={imageUrl}
              alt={`상품 이미지 ${index + 1}`}
              className="product-image-slider__image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = FALLBACK_IMAGE;
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      {displayImages.length > 1 && (
        <div className="product-image-slider__indicator">
          {currentIndex + 1} / {displayImages.length}
        </div>
      )}
    </div>
  );
}
