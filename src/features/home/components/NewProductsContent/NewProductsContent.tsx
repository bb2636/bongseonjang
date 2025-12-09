import { useState } from 'react';
import { FilterChips } from '../FilterChips';
import { PRODUCT_CATEGORIES } from '../../constants/productCategories';
import './NewProductsContent.css';

export default function NewProductsContent() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <div className="new-products-content">
      <FilterChips
        chips={PRODUCT_CATEGORIES}
        selectedChipId={selectedCategory}
        onChipSelect={setSelectedCategory}
      />
      <div className="new-products-content__placeholder">
        <h2 className="new-products-content__title">신상품</h2>
        <p className="new-products-content__description">준비 중입니다</p>
      </div>
    </div>
  );
}
