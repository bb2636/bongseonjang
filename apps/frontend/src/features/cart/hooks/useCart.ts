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
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartDto>(['cart']);
      
      if (previousCart) {
        queryClient.setQueryData<CartDto>(['cart'], {
          ...previousCart,
          items: previousCart.items.map(item =>
            item.id === itemId
              ? { ...item, quantity, totalPrice: item.unitPrice * quantity }
              : item
          ),
          itemCount: previousCart.items.reduce((sum, item) => 
            sum + (item.id === itemId ? quantity : item.quantity), 0
          ),
          subtotal: previousCart.items.reduce((sum, item) =>
            sum + (item.id === itemId ? item.unitPrice * quantity : item.totalPrice), 0
          ),
        });
      }
      
      return { previousCart };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      refreshCartContext();
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: removeItem,
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartDto>(['cart']);
      
      if (previousCart) {
        const removedItem = previousCart.items.find(item => item.id === itemId);
        queryClient.setQueryData<CartDto>(['cart'], {
          ...previousCart,
          items: previousCart.items.filter(item => item.id !== itemId),
          itemCount: previousCart.itemCount - (removedItem?.quantity ?? 0),
          subtotal: previousCart.subtotal - (removedItem?.totalPrice ?? 0),
        });
      }
      
      setSelectedItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
      
      return { previousCart };
    },
    onError: (_err, itemId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
        setSelectedItems(prev => {
          const next = new Set(prev);
          next.add(itemId);
          return next;
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      refreshCartContext();
    },
  });

  const removeSelectedMutation = useMutation({
    mutationFn: removeSelectedItems,
    onMutate: async (itemIds) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartDto>(['cart']);
      const previousSelected = new Set(selectedItems);
      
      if (previousCart) {
        const itemIdSet = new Set(itemIds);
        const removedItems = previousCart.items.filter(item => itemIdSet.has(item.id));
        const removedQuantity = removedItems.reduce((sum, item) => sum + item.quantity, 0);
        const removedTotal = removedItems.reduce((sum, item) => sum + item.totalPrice, 0);
        
        queryClient.setQueryData<CartDto>(['cart'], {
          ...previousCart,
          items: previousCart.items.filter(item => !itemIdSet.has(item.id)),
          itemCount: previousCart.itemCount - removedQuantity,
          subtotal: previousCart.subtotal - removedTotal,
        });
      }
      
      setSelectedItems(new Set());
      
      return { previousCart, previousSelected };
    },
    onError: (_err, _itemIds, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
        setSelectedItems(context.previousSelected);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      refreshCartContext();
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
    
    const itemIds = Array.from(selectedItems).join(',');
    
    if (isAuthenticated) {
      queryClient.prefetchQuery({
        queryKey: ['defaultAddress'],
        queryFn: fetchDefaultAddress,
        staleTime: 1000 * 60 * 5,
      });
      navigate(`/checkout?items=${itemIds}`);
    } else {
      navigate(`/checkout/guest?items=${itemIds}`);
    }
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
