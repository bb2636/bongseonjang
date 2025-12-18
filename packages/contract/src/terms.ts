export type TermsType = 'SERVICE' | 'PRIVACY_POLICY' | 'PURCHASE_POLICY' | 'MARKETING';

export interface TermsDto {
  id: number;
  type: TermsType;
  title: string;
  content: string;
  version: string;
  isRequired: boolean;
  isActive: boolean;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface TermsListRequest {
  type?: TermsType;
  isActive?: boolean;
}

export interface TermsListResponse {
  terms: TermsDto[];
}

export interface TermsContentRequest {
  type: TermsType;
}

export interface TermsContentResponse {
  terms: TermsDto | null;
}

export interface AcceptTermsRequest {
  termsIds: number[];
}

export interface AcceptTermsResponse {
  success: boolean;
  message?: string;
}
