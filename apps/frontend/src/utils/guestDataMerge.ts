import { guestCartStorage, guestWishlistStorage } from './guestStorage';
import { mergeGuestCart, MergeCartItem } from '../features/cart/api/cartApi';
import { API_BASE_URL } from '../shared/config/apiConfig';

export interface MergeWishlistItem {
  productId: string;
}

async function mergeGuestWishlist(items: MergeWishlistItem[]): Promise<{ mergedCount: number }> {
  const token = localStorage.getItem('user_token');
  
  const response = await fetch(`${API_BASE_URL}/wishlist/merge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items }),
  });

  if (!response.ok) {
    throw new Error('Failed to merge wishlist');
  }

  return response.json();
}

export async function mergeGuestDataToServer(): Promise<void> {
  const guestCartItems = guestCartStorage.getItems();
  const guestWishlistItems = guestWishlistStorage.getItems();

  if (guestCartItems.length === 0 && guestWishlistItems.length === 0) {
    return;
  }

  try {
    if (guestCartItems.length > 0) {
      const cartItemsToMerge: MergeCartItem[] = guestCartItems.map(item => ({
        productId: item.productId,
        optionId: item.optionId,
        quantity: item.quantity,
      }));

      await mergeGuestCart(cartItemsToMerge);
      guestCartStorage.clear();
    }

    if (guestWishlistItems.length > 0) {
      const wishlistItemsToMerge: MergeWishlistItem[] = guestWishlistItems.map(item => ({
        productId: item.productId,
      }));

      await mergeGuestWishlist(wishlistItemsToMerge);
      guestWishlistStorage.clear();
    }

    console.log('[GuestDataMerge] Successfully merged guest data to server');
  } catch (error) {
    console.error('[GuestDataMerge] Failed to merge guest data:', error);
  }
}
