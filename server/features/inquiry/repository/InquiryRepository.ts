import type { InquiryListItem, InquiryDetail, InquiryFilter, InquiryType } from '../domain/Inquiry';

export interface InquiryRepository {
  findAll(filter: InquiryFilter): Promise<{ inquiries: InquiryListItem[]; total: number }>;
  findById(id: number): Promise<InquiryDetail | null>;
  updateAnswer(id: number, answer: string, answeredBy: string): Promise<void>;
  deleteAnswer(id: number): Promise<void>;
}
