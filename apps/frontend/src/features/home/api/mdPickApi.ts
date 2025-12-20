import type { MdPickProduct } from '../types/mdPick';
import { API_BASE_URL } from '../../../shared/config/apiConfig';

export async function fetchMdPicks(): Promise<MdPickProduct[]> {
  const response = await fetch(`${API_BASE_URL}/products/tag/md_pick`);
  if (!response.ok) {
    throw new Error('Failed to fetch MD picks');
  }
  return response.json();
}
