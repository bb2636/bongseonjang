import { useWishlist } from '../hooks/useWishlist';
import WishlistView from '../views/WishlistView';

export default function WishlistPage() {
  const {
    items,
    count,
    cartCount,
    isLoading,
    handleRemoveFromWishlist,
    handleAddToCart,
    handleBack,
    handleCartClick,
    handleProductClick,
  } = useWishlist();

  return (
    <WishlistView
      items={items}
      count={count}
      cartCount={cartCount}
      isLoading={isLoading}
      onBack={handleBack}
      onCartClick={handleCartClick}
      onRemoveItem={handleRemoveFromWishlist}
      onAddToCart={handleAddToCart}
      onProductClick={handleProductClick}
    />
  );
}
