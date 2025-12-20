import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilterChips } from '../FilterChips';
import { ProductGridContent } from '@/components/ProductGridContent';
import { useProductCategories } from '../../hooks/useProductCategories';
import { useProductsByCategory } from '../../hooks/useProductsByCategory';
import './NewProductsContent.css';

const DISPLAY_CATEGORY = '신상품';

export default function NewProductsContent() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { categories } = useProductCategories();
  const { products, isLoading, error } = useProductsByCategory(DISPLAY_CATEGORY, selectedCategory);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="new-products-content">
      <FilterChips
        chips={categories}
        selectedChipId={selectedCategory}
        onChipSelect={setSelectedCategory}
      />
      <ProductGridContent
        products={products}
        isLoading={isLoading}
        error={error}
        onProductClick={handleProductClick}
      />
    </div>
  );
}
