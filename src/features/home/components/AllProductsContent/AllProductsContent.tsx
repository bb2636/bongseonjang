import { useState } from 'react';
import { FilterChips } from '../FilterChips';
import { PRODUCT_CATEGORIES } from '../../constants/productCategories';
import './AllProductsContent.css';

export default function AllProductsContent() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <div className="all-products-content">
      <FilterChips
        chips={PRODUCT_CATEGORIES}
        selectedChipId={selectedCategory}
        onChipSelect={setSelectedCategory}
      />
      <div className="all-products-content__placeholder">
        <h2 className="all-products-content__title">전체상품</h2>
        <p className="all-products-content__description">준비 중입니다</p>
      </div>
    </div>
  );
}
