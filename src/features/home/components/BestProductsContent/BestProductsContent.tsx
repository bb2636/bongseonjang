import { useState } from 'react';
import { FilterChips } from '../FilterChips';
import { PRODUCT_CATEGORIES } from '../../constants/productCategories';
import './BestProductsContent.css';

export default function BestProductsContent() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <div className="best-products-content">
      <FilterChips
        chips={PRODUCT_CATEGORIES}
        selectedChipId={selectedCategory}
        onChipSelect={setSelectedCategory}
      />
      <div className="best-products-content__placeholder">
        <h2 className="best-products-content__title">베스트 상품</h2>
        <p className="best-products-content__description">준비 중입니다</p>
      </div>
    </div>
  );
}
