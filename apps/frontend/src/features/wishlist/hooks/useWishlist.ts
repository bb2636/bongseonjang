import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { wishlistApi, WishlistItem } from '../api/wishlistApi';
import { useToast } from '../../../contexts/ToastContext';
import { useCart } from '../../../contexts/CartContext';
import { useQuickCart } from '../../../contexts/QuickCartContext';
import { guestWishlistStorage, GuestWishlistItem } from '../../../utils/guestStorage';

export function useWishlist() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { cartCount } = useCart();
  const { openQuickCart } = useQuickCart();
  const { isAuthenticated } = useAuth();
  
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWishlistData = useCallback(async () => {
    try {
      if (isAuthenticated) {
        const token = localStorage.getItem('user_token');
        if (!token) {
          setItems([]);
          setCount(0);
          setIsLoading(false);
          return;
        }

        const data = await wishlistApi.fetchWishlist();
        setItems(data.items);
        setCount(data.count);
      } else {
        const guestItems = guestWishlistStorage.getItems();
        const mappedItems: WishlistItem[] = guestItems.map((item: GuestWishlistItem) => ({
          id: `guest_${item.productId}`,
          productId: item.productId,
          name: item.name,
          originalPrice: item.originalPrice,
          discountedPrice: item.discountedPrice,
          discountRate: item.discountRate,
          thumbnailUrl: item.thumbnailUrl,
          addedAt: item.addedAt,
        }));
        setItems(mappedItems);
        setCount(guestItems.length);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      showToast('찜 목록을 불러오는데 실패했습니다', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, showToast]);

  useEffect(() => {
    fetchWishlistData();
  }, [fetchWishlistData]);

  const handleRemoveFromWishlist = useCallback(async (productId: string) => {
    try {
      if (isAuthenticated) {
        await wishlistApi.removeFromWishlist(productId);
      } else {
        guestWishlistStorage.removeItem(productId);
      }
      setItems((prev) => prev.filter((item) => item.productId !== productId));
      setCount((prev) => Math.max(0, prev - 1));
      showToast('찜 목록에서 삭제되었습니다', 'success');
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      showToast('찜 삭제에 실패했습니다', 'error');
    }
  }, [isAuthenticated, showToast]);

  const handleAddToCart = useCallback((productId: string) => {
    openQuickCart(productId);
  }, [openQuickCart]);

  const handleBack = useCallback(() => {
    navigate('/profile');
  }, [navigate]);

  const handleCartClick = useCallback(() => {
    navigate('/cart');
  }, [navigate]);

  const handleProductClick = useCallback((productId: string) => {
    navigate(`/product/${productId}`);
  }, [navigate]);

  return {
    items,
    count,
    isLoading,
    cartCount,
    isGuest: !isAuthenticated,
    handleRemoveFromWishlist,
    handleAddToCart,
    handleBack,
    handleCartClick,
    handleProductClick,
    refreshWishlist: fetchWishlistData,
  };
}
