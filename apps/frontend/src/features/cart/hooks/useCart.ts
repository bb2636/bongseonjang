import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart as useCartContext } from '../../../contexts/CartContext';
import {
  fetchCart,
  updateItemQuantity,
  removeItem,
  removeSelectedItems,
  type CartDto,
} from '../api/cartApi';
import { fetchDefaultAddress } from '../../address/api/addressApi';
import { guestCartStorage, GuestCartItem } from '../../../utils/guestStorage';

interface GuestCartDto {
  items: GuestCartItem[];
  totalItems: number;
  totalPrice: number;
}

export function useCart() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { refreshCart: refreshCartContext } = useCartContext();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [guestCart, setGuestCart] = useState<GuestCartDto | null>(null);
  const [isGuestLoading, setIsGuestLoading] = useState(true);

  const loadGuestCart = useCallback(() => {
    const items = guestCartStorage.getItems();
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);
    setGuestCart({ items, totalItems, totalPrice });
    setIsGuestLoading(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      loadGuestCart();
    }
  }, [isAuthenticated, loadGuestCart]);

  const {
    data: serverCart,
    isLoading: isServerLoading,
    error,
    refetch,
  } = useQuery<CartDto>({
    queryKey: ['cart'],
    queryFn: fetchCart,
    staleTime: 0,
    enabled: isAuthenticated,
  });

  const cart: CartDto | undefined = isAuthenticated ? serverCart : guestCart ? {
    id: 'guest_cart',
    items: guestCart.items.map(item => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productImageUrl: item.thumbnailUrl,
      productOptionId: item.optionId ? parseInt(item.optionId) : null,
      productOptionName: item.optionName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      compareAtPrice: null,
      totalPrice: item.totalPrice,
    })),
    itemCount: guestCart.totalItems,
    subtotal: guestCart.totalPrice,
  } : undefined;

  const isLoading = isAuthenticated ? isServerLoading : isGuestLoading;

  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateItemQuantity(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: removeItem,
    onSuccess: (_, itemId) => {
      setSelectedItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeSelectedMutation = useMutation({
    mutationFn: removeSelectedItems,
    onSuccess: () => {
      setSelectedItems(new Set());
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const toggleSelectItem = useCallback((itemId: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (!cart) return;
    
    const allItemIds = cart.items.map(item => item.id);
    const allSelected = allItemIds.every(id => selectedItems.has(id));
    
    if (allSelected) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(allItemIds));
    }
  }, [cart, selectedItems]);

  const handleQuantityChange = useCallback((itemId: string, quantity: number) => {
    if (isAuthenticated) {
      updateQuantityMutation.mutate({ itemId, quantity });
    } else {
      guestCartStorage.updateQuantity(itemId, quantity);
      loadGuestCart();
      refreshCartContext();
    }
  }, [isAuthenticated, updateQuantityMutation, loadGuestCart, refreshCartContext]);

  const handleRemoveItem = useCallback((itemId: string) => {
    if (isAuthenticated) {
      removeItemMutation.mutate(itemId);
    } else {
      guestCartStorage.removeItem(itemId);
      setSelectedItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
      loadGuestCart();
      refreshCartContext();
    }
  }, [isAuthenticated, removeItemMutation, loadGuestCart, refreshCartContext]);

  const handleRemoveSelected = useCallback(() => {
    if (selectedItems.size === 0) return;
    
    if (isAuthenticated) {
      removeSelectedMutation.mutate(Array.from(selectedItems));
    } else {
      guestCartStorage.removeItems(Array.from(selectedItems));
      setSelectedItems(new Set());
      loadGuestCart();
      refreshCartContext();
    }
  }, [selectedItems, isAuthenticated, removeSelectedMutation, loadGuestCart, refreshCartContext]);

  const handleOrder = useCallback(() => {
    if (selectedItems.size === 0) return;
    
    if (isAuthenticated) {
      queryClient.prefetchQuery({
        queryKey: ['defaultAddress'],
        queryFn: fetchDefaultAddress,
        staleTime: 1000 * 60 * 5,
      });
    }
    
    const itemIds = Array.from(selectedItems).join(',');
    navigate(`/checkout?items=${itemIds}`);
  }, [navigate, selectedItems, queryClient, isAuthenticated]);

  const isAllSelected = useMemo(() => {
    if (!cart || cart.items.length === 0) return false;
    return cart.items.every(item => selectedItems.has(item.id));
  }, [cart, selectedItems]);

  const selectedSummary = useMemo(() => {
    if (!cart || selectedItems.size === 0) {
      return { subtotal: 0, itemCount: 0 };
    }

    const selectedCartItems = cart.items.filter(item => selectedItems.has(item.id));
    const subtotal = selectedCartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const itemCount = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);

    return { subtotal, itemCount };
  }, [cart, selectedItems]);

  return {
    cart,
    isLoading,
    error,
    selectedItems,
    isAllSelected,
    selectedSummary,
    toggleSelectItem,
    toggleSelectAll,
    handleQuantityChange,
    handleRemoveItem,
    handleRemoveSelected,
    handleOrder,
    refetch: isAuthenticated ? refetch : loadGuestCart,
    isUpdating: updateQuantityMutation.isPending || removeItemMutation.isPending || removeSelectedMutation.isPending,
    isGuest: !isAuthenticated,
  };
}
