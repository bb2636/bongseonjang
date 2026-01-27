import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import type { BongseonjangTvImage } from '../../types/bongseonjangTv';
import './BongseonjangTvSection.css';
import 'swiper/css';
import 'swiper/css/pagination';

interface BongseonjangTvSectionProps {
  tvImages: BongseonjangTvImage[];
  isLoading: boolean;
}

const TV_BANNER_HEIGHT = 210;
const AUTOPLAY_DELAY = 3000;

export default function BongseonjangTvSection({ tvImages, isLoading }: BongseonjangTvSectionProps) {
  if (isLoading) {
    return (
      <section className="bongseonjang-tv">
        <header className="bongseonjang-tv__header">
          <h2 className="bongseonjang-tv__title">봉선장 tv</h2>
        </header>
        <div className="bongseonjang-tv__content bongseonjang-tv__content--loading" />
      </section>
    );
  }

  if (tvImages.length === 0) {
    return (
      <section className="bongseonjang-tv">
        <header className="bongseonjang-tv__header">
          <h2 className="bongseonjang-tv__title">봉선장 tv</h2>
        </header>
        <div className="bongseonjang-tv__content bongseonjang-tv__content--empty" />
      </section>
    );
  }

  return (
    <section className="bongseonjang-tv">
      <header className="bongseonjang-tv__header">
        <h2 className="bongseonjang-tv__title">봉선장 tv</h2>
      </header>
      <div className="bongseonjang-tv__content">
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: AUTOPLAY_DELAY, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop={tvImages.length > 1}
          className="bongseonjang-tv__swiper"
          style={{ height: TV_BANNER_HEIGHT }}
          touchReleaseOnEdges={true}
        >
          {tvImages.map((image, index) => (
            <SwiperSlide key={image.id}>
              {image.linkUrl ? (
                <a href={image.linkUrl} className="bongseonjang-tv__link">
                  <img
                    src={image.imageUrl}
                    alt=""
                    className="bongseonjang-tv__image"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </a>
              ) : (
                <img
                  src={image.imageUrl}
                  alt=""
                  className="bongseonjang-tv__image"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
