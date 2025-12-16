import { Swiper, SwiperSlide } from 'swiper/react';
import { SectionHeader } from '@/components/SectionHeader';
import { LargeProductCard } from '@/components/LargeProductCard';
import type { BestProduct } from '../../types/bestProduct';
import 'swiper/css';
import './BestProductSection.css';

interface BestProductSectionProps {
  products: BestProduct[];
  isLoading: boolean;
  onViewAll?: () => void;
}

export default function BestProductSection({
  products,
  isLoading,
  onViewAll,
}: BestProductSectionProps) {
  if (isLoading) {
    return (
      <section className="best-product-section">
        <SectionHeader title="베스트 상품" />
        <div className="best-product-section__loading">로딩 중...</div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="best-product-section">
      <SectionHeader title="베스트 상품" onViewAll={onViewAll} />
      <div className="best-product-section__carousel">
        <Swiper
          slidesPerView="auto"
          spaceBetween={10}
          className="best-product-section__swiper"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id} className="best-product-section__slide">
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
