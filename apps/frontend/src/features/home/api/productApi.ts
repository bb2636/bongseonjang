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

export async function fetchProductsByCategoryId(categoryId: string, page: number = 1, limit: number = 20): Promise<{ products: ProductCardData[]; total: number }> {
  const url = `${API_BASE_URL}/products/by-category/${encodeURIComponent(categoryId)}?page=${page}&limit=${limit}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch products by category');
  }
  
  return response.json();
}

export async function fetchBestProducts(): Promise<ProductCardData[]> {
  const response = await fetch(`${API_BASE_URL}/best-products`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch best products');
  }
  
  return response.json();
}

export async function fetchNewProducts(): Promise<ProductCardData[]> {
  const response = await fetch(`${API_BASE_URL}/products/fresh`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch new products');
  }
  
  return response.json();
}

export async function fetchProductsByTag(
  tag: string,
  filter?: ProductFilter
): Promise<ProductCardData[]> {
  const params = new URLSearchParams();
  
  if (filter?.productCategory && filter.productCategory !== 'all') {
    params.set('productCategory', filter.productCategory);
  }
  
  const queryString = params.toString();
  const url = `${API_BASE_URL}/products/tag/${encodeURIComponent(tag)}${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch products by tag');
  }
  
  return response.json();
}
