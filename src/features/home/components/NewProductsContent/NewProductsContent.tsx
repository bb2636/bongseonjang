import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilterChips } from '../FilterChips';
import { ProductGridContent } from '@/components/ProductGridContent';
import { PRODUCT_CATEGORIES } from '../../constants/productCategories';
import { useProductsByCategory } from '../../hooks/useProductsByCategory';
import './NewProductsContent.css';

const DISPLAY_CATEGORY = '신상품';

export default function NewProductsContent() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { products, isLoading, error } = useProductsByCategory(DISPLAY_CATEGORY, selectedCategory);

  const handleAddToCart = (productId: string) => {
    console.log('Add to cart:', productId);
  };

  const handleToggleFavorite = (productId: string) => {
    console.log('Toggle favorite:', productId);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="new-products-content">
      <FilterChips
        chips={PRODUCT_CATEGORIES}
        selectedChipId={selectedCategory}
        onChipSelect={setSelectedCategory}
      />
      <ProductGridContent
        products={products}
        isLoading={isLoading}
        error={error}
        onAddToCart={handleAddToCart}
        onToggleFavorite={handleToggleFavorite}
        onProductClick={handleProductClick}
      />
    </div>
  );
}
