import { AppDataSource } from '../../../config/database';
import { ProductInquiry } from '../../../entity/ProductInquiry';
import { User } from '../../../entity/User';
import { Product } from '../../../entity/Product';
import type { InquiryRepository } from './InquiryRepository';
import type {
  CreateInquiryInput,
  InquiryListItem,
  InquiryDetail,
  InquiryFilter,
  InquiryType,
} from '../domain/Inquiry';
import { toAbsoluteImageUrl } from '../../../common/utils/imageUrl.js';

export class TypeORMInquiryRepository implements InquiryRepository {
  private get repository() {
    return AppDataSource.getRepository(ProductInquiry);
  }

  private get userRepository() {
    return AppDataSource.getRepository(User);
  }

  private get productRepository() {
    return AppDataSource.getRepository(Product);
  }

  async findAll(filter: InquiryFilter): Promise<{ inquiries: InquiryListItem[]; total: number }> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const offset = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('inquiry')
      .leftJoin(User, 'author', 'author.id = inquiry.authorId')
      .leftJoin(Product, 'product', 'product.id = inquiry.productId')
      .select([
        'inquiry.id as id',
        'inquiry.inquiryType as "inquiryType"',
        'inquiry.title as title',
        'inquiry.productId as "productId"',
        'product.name as "productName"',
        'inquiry.authorId as "authorId"',
        'author.name as "authorName"',
        'author.phone as "authorPhone"',
        'inquiry.question as question',
        'inquiry.isPrivate as "isPrivate"',
        'inquiry.imageUrls as "imageUrls"',
        'inquiry.answer as answer',
        'inquiry.createdAt as "createdAt"',
      ]);

    if (filter.keyword) {
      queryBuilder.andWhere(
        '(inquiry.question ILIKE :keyword OR author.name ILIKE :keyword OR product.name ILIKE :keyword)',
        { keyword: `%${filter.keyword}%` }
      );
    }

    if (filter.inquiryType && filter.inquiryType !== 'all') {
      queryBuilder.andWhere('inquiry.inquiryType = :type', { type: filter.inquiryType });
    }

    if (filter.status === 'answered') {
      queryBuilder.andWhere('inquiry.answer IS NOT NULL');
    } else if (filter.status === 'unanswered') {
      queryBuilder.andWhere('inquiry.answer IS NULL');
    }

    const total = await queryBuilder.getCount();

    const rawResults = await queryBuilder
      .orderBy('inquiry.createdAt', 'DESC')
      .offset(offset)
      .limit(limit)
      .getRawMany();

    const inquiries: InquiryListItem[] = rawResults.map((row: Record<string, unknown>) => ({
      id: Number(row.id),
      inquiryType: row.inquiryType as InquiryType,
      productId: row.productId as string | null,
      productName: row.productName as string | null,
      authorId: row.authorId as string,
      authorName: (row.authorName as string) || '알 수 없음',
      authorPhone: row.authorPhone as string | null,
      title: row.title as string,
      question: row.question as string,
      isAnswered: row.answer !== null,
      isPrivate: Boolean(row.isPrivate),
      imageUrls: ((row.imageUrls as string[]) ?? []).map(url => toAbsoluteImageUrl(url)),
      createdAt: row.createdAt as Date,
    }));

    return { inquiries, total };
  }

  async findById(id: number): Promise<InquiryDetail | null> {
    const inquiry = await this.repository.findOne({
      where: { id },
    });

    if (!inquiry) {
      return null;
    }

    const author = await this.userRepository.findOne({
      where: { id: inquiry.authorId },
    });

    let product = null;
    if (inquiry.productId) {
      product = await this.productRepository.findOne({
        where: { id: inquiry.productId },
      });
    }

    let answerer = null;
    if (inquiry.answeredBy) {
      answerer = await this.userRepository.findOne({
        where: { id: inquiry.answeredBy },
      });
    }

    return {
      id: Number(inquiry.id),
      inquiryType: inquiry.inquiryType,
      productId: inquiry.productId,
      productName: product?.name || null,
      authorId: inquiry.authorId,
      authorName: author?.name || '알 수 없음',
      authorPhone: author?.phone || null,
      title: inquiry.title,
      question: inquiry.question,
      answer: inquiry.answer,
      answeredAt: inquiry.answeredAt,
      answeredBy: inquiry.answeredBy,
      answererName: answerer?.name || null,
      isPrivate: inquiry.isPrivate,
      imageUrls: (inquiry.imageUrls ?? []).map(url => toAbsoluteImageUrl(url)),
      createdAt: inquiry.createdAt,
      updatedAt: inquiry.updatedAt,
    };
  }

  async createInquiry(data: CreateInquiryInput): Promise<InquiryDetail> {
    const inquiry = this.repository.create({
      inquiryType: data.inquiryType,
      productId: data.productId,
      authorId: data.authorId,
      title: data.title,
      question: data.question,
      isPrivate: data.isPrivate ?? false,
      imageUrls: data.imageUrls ?? [],
    });

    const savedInquiry = await this.repository.save(inquiry);

    return {
      id: Number(savedInquiry.id),
      inquiryType: savedInquiry.inquiryType,
      productId: savedInquiry.productId,
      productName: null,
      authorId: savedInquiry.authorId,
      authorName: '알 수 없음',
      authorPhone: null,
      title: savedInquiry.title,
      question: savedInquiry.question,
      answer: savedInquiry.answer,
      answeredAt: savedInquiry.answeredAt,
      answeredBy: savedInquiry.answeredBy,
      answererName: null,
      isPrivate: savedInquiry.isPrivate,
      imageUrls: (savedInquiry.imageUrls ?? []).map(url => toAbsoluteImageUrl(url)),
      createdAt: savedInquiry.createdAt,
      updatedAt: savedInquiry.updatedAt,
    };
  }

  async updateAnswer(id: number, answer: string, answeredBy: string): Promise<void> {
    await this.repository.update(id, {
      answer,
      answeredBy,
      answeredAt: new Date(),
    });
  }

  async deleteAnswer(id: number): Promise<void> {
    await this.repository.update(id, {
      answer: null,
      answeredBy: null,
      answeredAt: null,
    });
  }
}
