import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { wishlistApi, WishlistItem } from '../api/wishlistApi';
import { useToast } from '../../../contexts/ToastContext';
import { useCart } from '../../../contexts/CartContext';

export function useWishlist() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { cartCount } = useCart();
  
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWishlistData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setItems([]);
        setCount(0);
        setIsLoading(false);
        return;
      }

      const data = await wishlistApi.fetchWishlist();
      setItems(data.items);
      setCount(data.count);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      showToast('찜 목록을 불러오는데 실패했습니다', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchWishlistData();
  }, [fetchWishlistData]);

  const handleRemoveFromWishlist = useCallback(async (productId: string) => {
    try {
      await wishlistApi.removeFromWishlist(productId);
      setItems((prev) => prev.filter((item) => item.productId !== productId));
      setCount((prev) => Math.max(0, prev - 1));
      showToast('찜 목록에서 삭제되었습니다', 'success');
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      showToast('찜 삭제에 실패했습니다', 'error');
    }
  }, [showToast]);

  const handleAddToCart = useCallback((productId: string) => {
    navigate(`/products/${productId}`);
  }, [navigate]);

  const handleBack = useCallback(() => {
    navigate('/profile');
  }, [navigate]);

  const handleCartClick = useCallback(() => {
    navigate('/cart');
  }, [navigate]);

  const handleProductClick = useCallback((productId: string) => {
    navigate(`/products/${productId}`);
  }, [navigate]);

  return {
    items,
    count,
    isLoading,
    cartCount,
    handleRemoveFromWishlist,
    handleAddToCart,
    handleBack,
    handleCartClick,
    handleProductClick,
    refreshWishlist: fetchWishlistData,
  };
}
