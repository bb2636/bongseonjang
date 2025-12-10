import type { ProductCardData } from '@/components/ProductCard';

const API_BASE_URL = '/api/products';

export async function fetchProductsByCategory(categoryName: string): Promise<ProductCardData[]> {
  const response = await fetch(`${API_BASE_URL}/category/${encodeURIComponent(categoryName)}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  
  return response.json();
}

export async function fetchAllProducts(): Promise<ProductCardData[]> {
  const response = await fetch(API_BASE_URL);
  
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  
  return response.json();
}
