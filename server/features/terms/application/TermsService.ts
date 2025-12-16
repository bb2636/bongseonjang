import type { TermsRepository } from '../repository/TermsRepository';
import type { CreateTermsDto, TermsContent, TermsListResponse, UpdateTermsDto } from '../domain/Terms';
import type { TermsType } from '../../../entity';

export class TermsService {
  constructor(private readonly termsRepository: TermsRepository) {}

  async getLatestTerms(type: TermsType): Promise<TermsContent | null> {
    const terms = await this.termsRepository.findLatestByType(type);
    if (!terms) {
      return null;
    }

    return this.mapToContent(terms);
  }

  async getAllTerms(type?: TermsType): Promise<TermsListResponse> {
    const termsList = await this.termsRepository.findAll(type);
    return {
      terms: termsList.map(terms => this.mapToContent(terms)),
      total: termsList.length,
    };
  }

  async getTermsById(id: number): Promise<TermsContent | null> {
    const terms = await this.termsRepository.findById(id);
    if (!terms) {
      return null;
    }

    return this.mapToContent(terms);
  }

  async createTerms(dto: CreateTermsDto): Promise<TermsContent> {
    const terms = await this.termsRepository.create({
      type: dto.type,
      title: dto.title,
      content: dto.content,
      isActive: dto.isActive ?? true,
    });

    return this.mapToContent(terms);
  }

  async updateTerms(id: number, dto: UpdateTermsDto): Promise<TermsContent | null> {
    const updatedTerms = await this.termsRepository.update(id, {
      title: dto.title,
      content: dto.content,
      isActive: dto.isActive,
    });

    if (!updatedTerms) {
      return null;
    }

    return this.mapToContent(updatedTerms);
  }

  private mapToContent(terms: { id: number; type: TermsType; title: string; content: string; isActive: boolean; createdAt: Date; updatedAt: Date }): TermsContent {
    return {
      id: terms.id,
      type: terms.type,
      title: terms.title,
      content: terms.content,
      isActive: terms.isActive,
      createdAt: terms.createdAt.toISOString(),
      updatedAt: terms.updatedAt.toISOString(),
    };
  }
}
