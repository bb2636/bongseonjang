import type { ProductCardData } from '@/components/ProductCard';

const API_BASE_URL = '/api/products';

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
  const url = `${API_BASE_URL}/category/${encodeURIComponent(displayCategoryName)}${queryString ? `?${queryString}` : ''}`;
  
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
  const url = `${API_BASE_URL}${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  
  return response.json();
}
