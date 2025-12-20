import type { ProductCardData } from '@/components/ProductCard';
import { API_BASE_URL } from '../../../shared/config/apiConfig';

export interface ProductFilter {
  productCategory?: string;
}

export async function fetchProductsByDisplayCategory(
  displayCategoryName: string,
  filter?: ProductFilter
): Promise<ProductCardData[]> {
  const params = new URLSearchParams();
  
  if (filter?.productCategory && filter.productCategory !== 'all') {
    params.set('productCategory', filter.productCategory);
  }
  
  const queryString = params.toString();
  const url = `${API_BASE_URL}/products/category/${encodeURIComponent(displayCategoryName)}${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  
  return response.json();
}

export async function fetchAllProducts(filter?: ProductFilter): Promise<ProductCardData[]> {
  const params = new URLSearchParams();
  
  if (filter?.productCategory && filter.productCategory !== 'all') {
    params.set('productCategory', filter.productCategory);
  }
  
  const queryString = params.toString();
  const url = `${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  
  return response.json();
}
