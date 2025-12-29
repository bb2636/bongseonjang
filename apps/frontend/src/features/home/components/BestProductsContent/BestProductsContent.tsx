import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FilterChips } from '../FilterChips';
import { ProductGridContent } from '@/components/ProductGridContent';
import { useProductCategories } from '../../hooks/useProductCategories';
import { fetchBestProducts, type ProductFilter } from '../../api/productApi';
import type { ProductCardData } from '@/components/ProductCard';
import { useProductListCache } from '../../../productDetail/hooks/useProductListCache';
import './BestProductsContent.css';

export default function BestProductsContent() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { categories } = useProductCategories();
  const { primeProductDetailCache } = useProductListCache();

  const filter: ProductFilter = {};
  if (selectedCategory && selectedCategory !== 'all') {
    filter.productCategory = selectedCategory;
  }

  const { data, isLoading, error } = useQuery<ProductCardData[]>({
    queryKey: ['products', 'best', selectedCategory],
    queryFn: () => fetchBestProducts(filter),
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
    <div className="best-products-content">
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
