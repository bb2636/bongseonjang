import { useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/pagination';
import './BannerCarousel.css';

export interface BannerImage {
  id: number | string;
  imageUrl: string;
  linkUrl?: string;
}

interface BannerCarouselProps {
  images: BannerImage[];
  isLoading: boolean;
  height: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  pagination?: boolean;
  loop?: boolean;
  onSlideClick?: (image: BannerImage) => void;
}

const DEFAULT_AUTOPLAY_DELAY = 3000;

function isInternalLink(url: string): boolean {
  return url.startsWith('/');
}

export default function BannerCarousel({
  images = [],
  isLoading,
  height,
  autoplay = false,
  autoplayDelay = DEFAULT_AUTOPLAY_DELAY,
  pagination = false,
  loop = true,
  onSlideClick,
}: BannerCarouselProps) {
  const style = { height: `${height}px` };

  if (isLoading) {
    return <div className="banner-carousel banner-carousel--loading" style={style} />;
  }

  if (!images || images.length === 0) {
    return <div className="banner-carousel banner-carousel--empty" style={style} />;
  }

  const swiperModules = [];
  if (autoplay) swiperModules.push(Autoplay);
  if (pagination) swiperModules.push(Pagination);

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.setAttribute('data-loaded', 'true');
  }, []);

  const renderSlideContent = (image: BannerImage, index: number) => {
    const imgElement = (
      <img
        src={image.imageUrl}
        alt=""
        className="banner-carousel__image"
        loading={index === 0 ? "eager" : "lazy"}
        onLoad={handleImageLoad}
      />
    );

    if (image.linkUrl) {
      if (isInternalLink(image.linkUrl)) {
        return (
          <Link to={image.linkUrl} className="banner-carousel__link">
            {imgElement}
          </Link>
        );
      }
      return (
        <a href={image.linkUrl} className="banner-carousel__link" target="_blank" rel="noopener noreferrer">
          {imgElement}
        </a>
      );
    }

    if (onSlideClick) {
      return (
        <button
          type="button"
          className="banner-carousel__button"
          onClick={() => onSlideClick(image)}
        >
          {imgElement}
        </button>
      );
    }

    return imgElement;
  };

  return (
    <div className="banner-carousel" style={style}>
      <Swiper
        modules={swiperModules}
        autoplay={autoplay ? { delay: autoplayDelay, disableOnInteraction: false } : false}
        pagination={pagination ? { clickable: true } : false}
        loop={loop}
        className="banner-carousel__swiper"
      >
        {images.map((image, index) => (
          <SwiperSlide key={image.id}>
            {renderSlideContent(image, index)}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
