import { Swiper, SwiperSlide } from 'swiper/react';
import { SectionHeader } from '@/components/SectionHeader';
import { LargeProductCard } from '@/components/LargeProductCard';
import type { MdPickProduct } from '../../types/mdPick';
import 'swiper/css';
import './MdPickSection.css';

interface MdPickSectionProps {
  products: MdPickProduct[];
  isLoading: boolean;
}

export default function MdPickSection({
  products,
  isLoading,
}: MdPickSectionProps) {
  if (isLoading) {
    return (
      <section className="md-pick-section">
        <SectionHeader title="MD추천!" />
        <div className="md-pick-section__loading">로딩 중...</div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="md-pick-section">
      <SectionHeader title="MD추천!" />
      <div className="md-pick-section__carousel">
        <Swiper
          slidesPerView="auto"
          spaceBetween={10}
          className="md-pick-section__swiper"
          touchReleaseOnEdges={true}
        >
          {products.map((product) => (
            <SwiperSlide key={product.id} className="md-pick-section__slide">
              <LargeProductCard
                product={product}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
