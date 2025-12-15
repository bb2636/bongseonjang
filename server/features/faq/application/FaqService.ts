import type { FaqRepository } from '../repository/FaqRepository';
import type { FaqListResponse, FaqListItem, CreateFaqDto, UpdateFaqDto, FaqDetailResponse } from '../domain/Faq';

export class FaqService {
  constructor(private readonly faqRepository: FaqRepository) {}

  async getFaqsForAdmin(keyword?: string, categoryId?: number): Promise<FaqListResponse> {
    const [faqs, totalAll] = await Promise.all([
      this.faqRepository.findAllForAdmin(keyword, categoryId),
      this.faqRepository.countAll(),
    ]);

    const faqItems: FaqListItem[] = faqs.map((faq) => ({
      id: faq.id,
      categoryId: Number(faq.categoryId),
      categoryName: faq.category?.name ?? '',
      title: faq.title,
      isVisible: faq.isVisible,
      createdAt: faq.createdAt.toISOString(),
    }));

    return {
      faqs: faqItems,
      total: keyword || categoryId ? faqs.length : totalAll,
    };
  }

  async getFaqs(keyword?: string, categoryId?: number): Promise<FaqListResponse> {
    const [faqs, totalVisible] = await Promise.all([
      this.faqRepository.findAll(keyword, categoryId),
      this.faqRepository.countVisible(),
    ]);

    const faqItems: FaqListItem[] = faqs.map((faq) => ({
      id: faq.id,
      categoryId: Number(faq.categoryId),
      categoryName: faq.category?.name ?? '',
      title: faq.title,
      isVisible: faq.isVisible,
      createdAt: faq.createdAt.toISOString(),
    }));

    return {
      faqs: faqItems,
      total: keyword || categoryId ? faqs.length : totalVisible,
    };
  }

  async getFaqByIdForAdmin(id: number): Promise<FaqDetailResponse | null> {
    const faq = await this.faqRepository.findByIdForAdmin(id);
    if (!faq) {
      return null;
    }

    return {
      id: faq.id,
      categoryId: Number(faq.categoryId),
      categoryName: faq.category?.name ?? '',
      title: faq.title,
      content: faq.content,
      isVisible: faq.isVisible,
      createdAt: faq.createdAt.toISOString(),
      updatedAt: faq.updatedAt.toISOString(),
    };
  }

  async getFaqById(id: number): Promise<FaqDetailResponse | null> {
    const faq = await this.faqRepository.findById(id);
    if (!faq) {
      return null;
    }

    return {
      id: faq.id,
      categoryId: Number(faq.categoryId),
      categoryName: faq.category?.name ?? '',
      title: faq.title,
      content: faq.content,
      isVisible: faq.isVisible,
      createdAt: faq.createdAt.toISOString(),
      updatedAt: faq.updatedAt.toISOString(),
    };
  }

  async createFaq(dto: CreateFaqDto) {
    const faq = await this.faqRepository.create({
      categoryId: dto.categoryId,
      title: dto.title,
      content: dto.content,
      isVisible: dto.isVisible,
    });

    return {
      id: faq.id,
      categoryId: Number(faq.categoryId),
      title: faq.title,
      content: faq.content,
      isVisible: faq.isVisible,
      createdAt: faq.createdAt.toISOString(),
    };
  }

  async updateFaq(id: number, dto: UpdateFaqDto) {
    const faq = await this.faqRepository.update(id, {
      categoryId: dto.categoryId,
      title: dto.title,
      content: dto.content,
      isVisible: dto.isVisible,
    });

    if (!faq) {
      return null;
    }

    return {
      id: faq.id,
      categoryId: Number(faq.categoryId),
      title: faq.title,
      content: faq.content,
      isVisible: faq.isVisible,
      updatedAt: faq.updatedAt.toISOString(),
    };
  }

  async deleteFaq(id: number): Promise<boolean> {
    return this.faqRepository.delete(id);
  }
}
