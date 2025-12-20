import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilterChips } from '../FilterChips';
import { ProductGridContent } from '@/components/ProductGridContent';
import { PRODUCT_CATEGORIES } from '../../constants/productCategories';
import { useProductsByCategory } from '../../hooks/useProductsByCategory';
import './AllProductsContent.css';

export default function AllProductsContent() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { products, isLoading, error } = useProductsByCategory('', selectedCategory);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="all-products-content">
      <FilterChips
        chips={PRODUCT_CATEGORIES}
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
