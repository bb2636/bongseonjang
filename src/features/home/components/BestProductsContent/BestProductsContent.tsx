import { useState } from 'react';
import { FilterChips } from '../FilterChips';
import { LargeProductCard } from '@/components/LargeProductCard';
import { PRODUCT_CATEGORIES } from '../../constants/productCategories';
import { useBestProducts } from '../../hooks/useBestProducts';
import './BestProductsContent.css';

export default function BestProductsContent() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { bestProducts, isLoading, error } = useBestProducts();

  if (error) {
    return (
      <div className="best-products-content">
        <FilterChips
          chips={PRODUCT_CATEGORIES}
          selectedChipId={selectedCategory}
          onChipSelect={setSelectedCategory}
        />
        <div className="best-products-content__error">
          상품을 불러오는데 실패했습니다
        </div>
      </div>
    );
  }

  return (
    <div className="best-products-content">
      <FilterChips
        chips={PRODUCT_CATEGORIES}
        selectedChipId={selectedCategory}
        onChipSelect={setSelectedCategory}
      />
      {isLoading ? (
        <div className="best-products-content__loading">
          <div className="best-products-content__skeleton-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="best-products-content__skeleton-card" />
            ))}
          </div>
        </div>
      ) : (
        <div className="best-products-content__grid">
          {bestProducts.map((product) => (
            <div key={product.id} className="best-products-content__item">
              <div className="best-products-content__rank">{product.rank}</div>
              <LargeProductCard
                product={product}
                onAddToCart={() => console.log('Add to cart:', product.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
