import { useState } from 'react';
import { FilterChips } from '../FilterChips';
import { ProductGridContent } from '@/components/ProductGridContent';
import { PRODUCT_CATEGORIES } from '../../constants/productCategories';
import { useBestProducts } from '../../hooks/useBestProducts';
import type { ProductCardData } from '@/components/ProductCard';
import './BestProductsContent.css';

export default function BestProductsContent() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { bestProducts, isLoading, error } = useBestProducts();

  const products: ProductCardData[] = bestProducts.map((product) => ({
    id: product.id,
    name: product.name,
    imageUrl: product.imageUrl,
    originalPrice: product.originalPrice,
    discountPercent: product.discountPercent,
    discountedPrice: product.discountedPrice,
    isFavorite: false,
  }));

  const handleAddToCart = (productId: string) => {
    console.log('Add to cart:', productId);
  };

  const handleToggleFavorite = (productId: string) => {
    console.log('Toggle favorite:', productId);
  };

  const handleProductClick = (productId: string) => {
    console.log('Product clicked:', productId);
  };

  return (
    <div className="best-products-content">
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
