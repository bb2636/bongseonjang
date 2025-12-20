import { API_BASE_URL } from '../../../shared/config/apiConfig';

export interface EventData {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  startDate?: string;
  endDate?: string;
}

export async function fetchEvents(): Promise<EventData[]> {
  const response = await fetch(`${API_BASE_URL}/events`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  
  return response.json();
}
