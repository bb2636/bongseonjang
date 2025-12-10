import ProductCard from '../ProductCard/ProductCard';
import './ProductGrid.css';

interface Product {
  id: number;
  name: string;
  price: number;
  discountRate: number;
  imageUrl: string;
}

interface ProductGridProps {
  products: Product[];
  onProductClick: (productId: number) => void;
  onAddToCart: (productId: number) => void;
}

export default function ProductGrid({ 
  products, 
  onProductClick, 
  onAddToCart 
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="product-grid__empty">
        상품이 없습니다.
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          price={product.price}
          discountRate={product.discountRate}
          imageUrl={product.imageUrl}
          onClick={() => onProductClick(product.id)}
          onAddToCart={() => onAddToCart(product.id)}
        />
      ))}
    </div>
  );
}
