import type { InquiryRepository } from '../repository/InquiryRepository';
import type {
  CreateInquiryInput,
  InquiryListItem,
  InquiryDetail,
  InquiryFilter,
} from '../domain/Inquiry';

export class InquiryService {
  constructor(private readonly inquiryRepository: InquiryRepository) {}

  async getInquiries(filter: InquiryFilter): Promise<{ inquiries: InquiryListItem[]; total: number }> {
    return this.inquiryRepository.findAll(filter);
  }

  async getInquiryById(id: number): Promise<InquiryDetail | null> {
    return this.inquiryRepository.findById(id);
  }

  async createInquiry(data: CreateInquiryInput): Promise<InquiryDetail> {
    return this.inquiryRepository.createInquiry(data);
  }

  async answerInquiry(id: number, answer: string, answeredBy: string): Promise<void> {
    const inquiry = await this.inquiryRepository.findById(id);
    if (!inquiry) {
      throw new Error('문의를 찾을 수 없습니다.');
    }
    await this.inquiryRepository.updateAnswer(id, answer, answeredBy);
  }

  async deleteAnswer(id: number): Promise<void> {
    const inquiry = await this.inquiryRepository.findById(id);
    if (!inquiry) {
      throw new Error('문의를 찾을 수 없습니다.');
    }
    await this.inquiryRepository.deleteAnswer(id);
  }
}
