export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  originalPrice: number;
  discountedPrice: number;
  discountRate: number;
  thumbnailUrl: string;
  addedAt: string;
}

interface WishlistResponse {
  items: WishlistItem[];
  count: number;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('user_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchWishlist(): Promise<WishlistResponse> {
  const response = await fetch('/api/wishlist', {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch wishlist');
  }
  
  return response.json();
}

export async function addToWishlist(productId: string): Promise<{ success: boolean; isWishlisted: boolean }> {
  const response = await fetch('/api/wishlist/items', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ productId }),
  });
  
  return response.json();
}

export async function removeFromWishlist(productId: string): Promise<{ success: boolean; isWishlisted: boolean }> {
  const response = await fetch(`/api/wishlist/items/${productId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  return response.json();
}

export async function checkWishlistStatus(productId: string): Promise<{ isWishlisted: boolean }> {
  const response = await fetch(`/api/wishlist/check/${productId}`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    return { isWishlisted: false };
  }
  
  return response.json();
}

export async function getWishlistCount(): Promise<{ count: number }> {
  const response = await fetch('/api/wishlist/count', {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    return { count: 0 };
  }
  
  return response.json();
}

export const wishlistApi = {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus,
  getWishlistCount,
};
