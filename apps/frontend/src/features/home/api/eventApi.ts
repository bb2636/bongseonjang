export interface EventData {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  startDate?: string;
  endDate?: string;
}

const API_BASE_URL = '/api/events';

export async function fetchEvents(): Promise<EventData[]> {
  const response = await fetch(API_BASE_URL);
  
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  
  return response.json();
}
