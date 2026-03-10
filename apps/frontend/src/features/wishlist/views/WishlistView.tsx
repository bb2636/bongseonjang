import { AppBar, AppBarSpacer } from '../../../components/AppBar';
import { WishlistProductCard } from '../components/WishlistProductCard';
import WishlistSkeleton from '../components/WishlistSkeleton';
import type { WishlistItem } from '../api/wishlistApi';
import './WishlistView.css';

interface WishlistViewProps {
  items: WishlistItem[];
  count: number;
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
        <AppBar variant="subpage" title="찜" onBackClick={onBack} onCartClick={onCartClick} />
        <AppBarSpacer variant="subpage" />
        <WishlistSkeleton />
      </div>
    );
  }

  return (
    <div className="wishlist">
      <AppBar variant="subpage" title="찜" onBackClick={onBack} onCartClick={onCartClick} />
      <AppBarSpacer variant="subpage" />

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
