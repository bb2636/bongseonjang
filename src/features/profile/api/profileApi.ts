import { UserProfile, Order } from '../types/profile';

export async function fetchUserProfile(): Promise<UserProfile> {
  const response = await fetch('/api/profile');
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  return response.json();
}

export async function fetchRecentOrders(): Promise<Order[]> {
  const response = await fetch('/api/profile/orders?limit=3');
  if (!response.ok) {
    throw new Error('Failed to fetch recent orders');
  }
  return response.json();
}
