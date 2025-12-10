import { ProductCard, ProductCardData } from '../ProductCard';
import './ProductGridContent.css';

interface ProductGridContentProps {
  products: ProductCardData[];
  isLoading: boolean;
  error?: Error | null;
  onAddToCart?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  onProductClick?: (productId: string) => void;
}

export default function ProductGridContent({
  products,
  isLoading,
  error,
  onAddToCart,
  onToggleFavorite,
  onProductClick,
}: ProductGridContentProps) {
  if (error) {
    return (
      <div className="product-grid-content__error">
        상품을 불러오는데 실패했습니다
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="product-grid-content__loading">
        <div className="product-grid-content__skeleton-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="product-grid-content__skeleton-card">
              <div className="product-grid-content__skeleton-image" />
              <div className="product-grid-content__skeleton-button" />
              <div className="product-grid-content__skeleton-text" />
              <div className="product-grid-content__skeleton-price" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="product-grid-content__empty">
        상품이 없습니다
      </div>
    );
  }

  return (
    <div className="product-grid-content">
      <div className="product-grid-content__grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={() => onAddToCart?.(product.id)}
            onToggleFavorite={() => onToggleFavorite?.(product.id)}
            onClick={() => onProductClick?.(product.id)}
          />
        ))}
      </div>
    </div>
  );
}
