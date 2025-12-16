import type { InquiryItem, InquiryDetail, CreateInquiryRequest } from '../types/inquiry';

export async function fetchMyInquiries(): Promise<InquiryItem[]> {
  const response = await fetch('/api/inquiries/my');
  if (!response.ok) {
    throw new Error('Failed to fetch inquiries');
  }
  const data = await response.json();
  return data.inquiries;
}

export async function fetchInquiryDetail(id: number): Promise<InquiryDetail> {
  const response = await fetch(`/api/inquiries/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch inquiry detail');
  }
  return response.json();
}

export async function createInquiry(data: CreateInquiryRequest): Promise<{ id: number }> {
  const response = await fetch('/api/inquiries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create inquiry');
  }
  return response.json();
}
