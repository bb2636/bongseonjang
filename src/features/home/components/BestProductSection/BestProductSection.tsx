import { Swiper, SwiperSlide } from 'swiper/react';
import { BestProductCard } from './BestProductCard';
import type { BestProduct } from '../../types/bestProduct';
import 'swiper/css';
import './BestProductSection.css';

interface BestProductSectionProps {
  products: BestProduct[];
  isLoading: boolean;
  onAddToCart?: (productId: string) => void;
  onViewAll?: () => void;
}

export default function BestProductSection({
  products,
  isLoading,
  onAddToCart,
  onViewAll,
}: BestProductSectionProps) {
  if (isLoading) {
    return (
      <section className="best-product-section">
        <div className="best-product-section__header">
          <h2 className="best-product-section__title">베스트 상품</h2>
        </div>
        <div className="best-product-section__loading">로딩 중...</div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="best-product-section">
      <div className="best-product-section__header">
        <h2 className="best-product-section__title">베스트 상품</h2>
        <button
          type="button"
          className="best-product-section__view-all"
          onClick={onViewAll}
        >
          <span>전체보기</span>
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.5 2.5L8.5 6.5L4.5 10.5"
              stroke="#3B9BD5"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="best-product-section__carousel">
        <Swiper
          slidesPerView="auto"
          spaceBetween={10}
          className="best-product-section__swiper"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id} className="best-product-section__slide">
              <BestProductCard
                product={product}
                onAddToCart={() => onAddToCart?.(product.id)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
