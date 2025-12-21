import type { HomeDataResponse, AboveFoldDataResponse, BelowFoldDataResponse } from '../types/homeData';
import { API_BASE_URL } from '../../../shared/config/apiConfig';

export async function fetchHomeData(): Promise<HomeDataResponse> {
  const response = await fetch(`${API_BASE_URL}/home/data`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch home data');
  }
  
  return response.json();
}

export async function fetchAboveFoldData(): Promise<AboveFoldDataResponse> {
  const response = await fetch(`${API_BASE_URL}/home/above-fold`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch above-fold data');
  }
  
  return response.json();
}

export async function fetchBelowFoldData(): Promise<BelowFoldDataResponse> {
  const response = await fetch(`${API_BASE_URL}/home/below-fold`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch below-fold data');
  }
  
  return response.json();
}
