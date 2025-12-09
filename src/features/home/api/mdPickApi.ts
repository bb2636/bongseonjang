import type { MdPickProduct } from '../types/mdPick';

const API_BASE_URL = '/api/md-picks';

export async function fetchMdPicks(): Promise<MdPickProduct[]> {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch MD picks');
  }
  return response.json();
}
