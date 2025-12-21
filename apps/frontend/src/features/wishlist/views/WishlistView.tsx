import { WishlistAppBar } from '../components/WishlistAppBar';
import { WishlistProductCard } from '../components/WishlistProductCard';
import WishlistSkeleton from '../components/WishlistSkeleton';
import type { WishlistItem } from '../api/wishlistApi';
import './WishlistView.css';

interface WishlistViewProps {
  items: WishlistItem[];
  count: number;
  cartCount: number;
  isLoading: boolean;
  onBack: () => void;
  onCartClick: () => void;
  onRemoveItem: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  onProductClick: (productId: string) => void;
}

export default function WishlistView({
  items,
  count,
  cartCount,
  isLoading,
  onBack,
  onCartClick,
  onRemoveItem,
  onAddToCart,
  onProductClick,
}: WishlistViewProps) {
  if (isLoading) {
    return (
      <div className="wishlist">
        <WishlistAppBar 
          onBackClick={onBack} 
          onCartClick={onCartClick}
          cartCount={cartCount}
        />
        <WishlistSkeleton />
      </div>
    );
  }

  return (
    <div className="wishlist">
      <WishlistAppBar 
        onBackClick={onBack} 
        onCartClick={onCartClick}
        cartCount={cartCount}
      />

      <div className="wishlist__count">
        전체 {count}개
      </div>

      {items.length === 0 ? (
        <div className="wishlist__empty">
          <span className="wishlist__empty-text">찜한 상품이 없습니다</span>
        </div>
      ) : (
        <div className="wishlist__grid">
          {items.map((item) => (
            <WishlistProductCard
              key={item.id}
              item={item}
              onRemove={() => onRemoveItem(item.productId)}
              onAddToCart={() => onAddToCart(item.productId)}
              onClick={() => onProductClick(item.productId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
