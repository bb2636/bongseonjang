import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FilterChips } from '../FilterChips';
import { ProductGridContent } from '@/components/ProductGridContent';
import { useProductCategories } from '../../hooks/useProductCategories';
import { fetchNewProducts, type ProductFilter } from '../../api/productApi';
import type { ProductCardData } from '@/components/ProductCard';
import { useProductListCache } from '../../../productDetail/hooks/useProductListCache';
import './NewProductsContent.css';

export default function NewProductsContent() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { categories } = useProductCategories();
  const { primeProductDetailCache } = useProductListCache();

  const filter: ProductFilter = {};
  if (selectedCategory && selectedCategory !== 'all') {
    filter.productCategory = selectedCategory;
  }

  const { data, isLoading, error } = useQuery<ProductCardData[]>({
    queryKey: ['products', 'new', selectedCategory],
    queryFn: () => fetchNewProducts(filter),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data && data.length > 0) {
      primeProductDetailCache(data);
    }
  }, [data, primeProductDetailCache]);

  const products = data ?? [];

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
