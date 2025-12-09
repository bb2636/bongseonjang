import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import type { HeroImage } from '../../types/heroImage';
import 'swiper/css';
import 'swiper/css/pagination';
import './HeroBanner.css';

interface HeroBannerProps {
  heroImages: HeroImage[];
  isLoading: boolean;
}

const AUTOPLAY_DELAY = 3000;

export default function HeroBanner({ heroImages, isLoading }: HeroBannerProps) {
  if (isLoading) {
    return <div className="hero-banner hero-banner--loading" />;
  }

  if (heroImages.length === 0) {
    return <div className="hero-banner hero-banner--empty" />;
  }

  return (
    <div className="hero-banner">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{
          delay: AUTOPLAY_DELAY,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        loop={true}
        className="hero-banner__swiper"
      >
        {heroImages.map((image) => (
          <SwiperSlide key={image.id}>
            {image.linkUrl ? (
              <a href={image.linkUrl} className="hero-banner__link">
                <img
                  src={image.imageUrl}
                  alt=""
                  className="hero-banner__image"
                />
              </a>
            ) : (
              <img
                src={image.imageUrl}
                alt=""
                className="hero-banner__image"
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
