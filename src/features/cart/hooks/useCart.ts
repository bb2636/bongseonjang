import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  fetchCart,
  updateItemQuantity,
  removeItem,
  removeSelectedItems,
  type CartDto,
} from '../api/cartApi';

export function useCart() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const {
    data: cart,
    isLoading,
    error,
    refetch,
  } = useQuery<CartDto>({
    queryKey: ['cart'],
    queryFn: fetchCart,
    staleTime: 0,
  });

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
    updateQuantityMutation.mutate({ itemId, quantity });
  }, [updateQuantityMutation]);

  const handleRemoveItem = useCallback((itemId: string) => {
    removeItemMutation.mutate(itemId);
  }, [removeItemMutation]);

  const handleRemoveSelected = useCallback(() => {
    if (selectedItems.size === 0) return;
    removeSelectedMutation.mutate(Array.from(selectedItems));
  }, [selectedItems, removeSelectedMutation]);

  const handleOrder = useCallback(() => {
    navigate('/orders/checkout');
  }, [navigate]);

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
    refetch,
    isUpdating: updateQuantityMutation.isPending || removeItemMutation.isPending || removeSelectedMutation.isPending,
  };
}
