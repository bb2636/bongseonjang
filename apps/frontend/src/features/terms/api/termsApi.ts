import { apiClient } from '../../../services/apiClient';
import type { TermsContent, TermsType } from '../types/terms';

const DEFAULT_TERMS_TYPE: TermsType = 'SERVICE';

export async function fetchLatestTerms(type: TermsType = DEFAULT_TERMS_TYPE): Promise<TermsContent> {
  return apiClient.get<TermsContent>(`/terms?type=${type}`);
}

export async function fetchAdminTerms(type?: TermsType): Promise<{ terms: TermsContent[]; total: number }> {
  const query = type ? `?type=${type}` : '';
  return apiClient.get(`/admin/terms${query}`);
}

export async function saveTerms(payload: {
  id?: number;
  type: TermsType;
  title: string;
  content: string;
  isActive?: boolean;
}): Promise<TermsContent> {
  if (payload.id) {
    return apiClient.put(`/admin/terms/${payload.id}`, {
      title: payload.title,
      content: payload.content,
      isActive: payload.isActive,
    });
  }

  return apiClient.post('/admin/terms', {
    type: payload.type,
    title: payload.title,
    content: payload.content,
    isActive: payload.isActive,
  });
}
