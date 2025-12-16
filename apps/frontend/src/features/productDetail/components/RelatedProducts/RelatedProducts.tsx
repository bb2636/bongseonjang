import { useNavigate } from 'react-router-dom';
import type { RelatedProduct } from '../../api/productDetailApi';
import './RelatedProducts.css';

interface RelatedProductsProps {
  products: RelatedProduct[];
  isLoading: boolean;
  onAddToCart?: (productId: string) => void;
}

const FALLBACK_IMAGE = 'https://placehold.co/167x175/f5f5f5/999999?text=No+Image';

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

export default function RelatedProducts({ products, isLoading, onAddToCart }: RelatedProductsProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="related-products">
        <div className="related-products__header">
          <h3 className="related-products__title">함께 본 상품</h3>
        </div>
        <div className="related-products__grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="related-products__skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    onAddToCart?.(productId);
  };

  return (
    <div className="related-products">
      <div className="related-products__header">
        <h3 className="related-products__title">함께 본 상품</h3>
      </div>
      <div className="related-products__grid">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="related-products__item"
            onClick={() => handleProductClick(product.id)}
          >
            <div className="related-products__image-wrapper">
              <img 
                src={product.imageUrl || FALLBACK_IMAGE} 
                alt={product.name}
                className="related-products__image"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = FALLBACK_IMAGE;
                }}
              />
            </div>
            <button
              type="button"
              className="related-products__add-button"
              onClick={(e) => handleAddToCart(e, product.id)}
            >
              <span className="related-products__add-icon">🛒</span>
              <span>담기</span>
            </button>
            <div className="related-products__info">
              <p className="related-products__name">{product.name}</p>
              <div className="related-products__price-row">
                {product.discountPercent > 0 && (
                  <span className="related-products__discount">{product.discountPercent}%</span>
                )}
                <span className="related-products__price">{formatPrice(product.discountedPrice)}원</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
