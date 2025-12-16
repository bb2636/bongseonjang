import type { TermsType } from '../../../entity';

export interface TermsContent {
  id: number;
  type: TermsType;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TermsListResponse {
  terms: TermsContent[];
  total: number;
}

export interface CreateTermsDto {
  type: TermsType;
  title: string;
  content: string;
  isActive?: boolean;
}

export interface UpdateTermsDto {
  title?: string;
  content?: string;
  isActive?: boolean;
}
