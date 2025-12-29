import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '@/components/ProductCard';
import type { ProductCardData } from '@/components/ProductCard';
import { useProductsByCategory } from '../../hooks/useProductsByCategory';
import './AllProductsContent.css';

interface CategoryGroup {
  categoryId: string;
  categoryName: string;
  products: ProductCardData[];
}

export default function AllProductsContent() {
  const navigate = useNavigate();
  const { products, isLoading, error } = useProductsByCategory('');

  const groupedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    const categoryMap = new Map<string, CategoryGroup>();

    for (const product of products) {
      const categoryId = product.categoryId || 'uncategorized';
      const categoryName = product.categoryName || '기타';

      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          categoryId,
          categoryName,
          products: [],
        });
      }

      categoryMap.get(categoryId)!.products.push(product);
    }

    return Array.from(categoryMap.values());
  }, [products]);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  if (isLoading) {
    return (
      <div className="all-products-content">
        <div className="all-products-content__loading">
          <div className="all-products-content__spinner" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="all-products-content">
        <div className="all-products-content__error">
          상품을 불러오는데 실패했습니다.
        </div>
      </div>
    );
  }

  if (groupedProducts.length === 0) {
    return (
      <div className="all-products-content">
        <div className="all-products-content__empty">
          등록된 상품이 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="all-products-content">
      {groupedProducts.map((group) => (
        <section key={group.categoryId} className="all-products-content__category-section">
          <h2 className="all-products-content__category-title">{group.categoryName}</h2>
          <div className="all-products-content__product-grid">
            {group.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
