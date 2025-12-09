import { useState } from 'react';
import { FilterChips } from '../FilterChips';
import { PRODUCT_CATEGORIES } from '../../constants/productCategories';
import './EventsContent.css';

export default function EventsContent() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <div className="events-content">
      <FilterChips
        chips={PRODUCT_CATEGORIES}
        selectedChipId={selectedCategory}
        onChipSelect={setSelectedCategory}
      />
      <div className="events-content__placeholder">
        <h2 className="events-content__title">이벤트</h2>
        <p className="events-content__description">준비 중입니다</p>
      </div>
    </div>
  );
}
