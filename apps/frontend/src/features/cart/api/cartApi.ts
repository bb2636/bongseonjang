import { CartDto, CartItemDto } from '@bongkru/contract';

export type { CartDto, CartItemDto };

export async function fetchCart(): Promise<CartDto> {
  const token = localStorage.getItem('user_token');
  
  const response = await fetch('/api/cart', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch cart');
  }

  return response.json();
}

export async function updateItemQuantity(itemId: string, quantity: number): Promise<void> {
  const token = localStorage.getItem('user_token');
  
  const response = await fetch(`/api/cart/items/${itemId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ quantity }),
  });

  if (!response.ok && response.status !== 204) {
    throw new Error('Failed to update item quantity');
  }
}

export async function removeItem(itemId: string): Promise<void> {
  const token = localStorage.getItem('user_token');
  
  const response = await fetch(`/api/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    throw new Error('Failed to remove item');
  }
}

export async function removeSelectedItems(itemIds: string[]): Promise<{ removedCount: number }> {
  const token = localStorage.getItem('user_token');
  
  const response = await fetch('/api/cart/items/remove-selected', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ itemIds }),
  });

  if (!response.ok) {
    throw new Error('Failed to remove selected items');
  }

  return response.json();
}

export interface MergeCartItem {
  productId: string;
  optionId: string | null;
  quantity: number;
}

export async function mergeGuestCart(items: MergeCartItem[]): Promise<{ mergedCount: number }> {
  const token = localStorage.getItem('user_token');
  
  const response = await fetch('/api/cart/merge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items }),
  });

  if (!response.ok) {
    throw new Error('Failed to merge cart');
  }

  return response.json();
}
