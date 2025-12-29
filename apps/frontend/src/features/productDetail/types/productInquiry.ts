export type InquiryStatus = 'pending' | 'answered';

export interface ProductInquiry {
  id: string;
  status: InquiryStatus;
  categoryLabel: string;
  authorAlias: string;
  createdAt: string;
  title: string;
  question?: string;
  answer?: string;
  isPrivate?: boolean;
  isAuthor?: boolean;
}
