import { AppDataSource } from '../../../config/database';
import { Terms } from '../../../entity';
import type { TermsRepository } from './TermsRepository';
import type { TermsType } from '../../../entity/Terms';

export class TypeORMTermsRepository implements TermsRepository {
  private get repository() {
    return AppDataSource.getRepository(Terms);
  }

  async findLatestByType(type: TermsType): Promise<Terms | null> {
    return this.repository.findOne({
      where: { type, isActive: true },
      order: { updatedAt: 'DESC' },
    });
  }

  async findAll(type?: TermsType): Promise<Terms[]> {
    const whereClause = type ? { type } : {};
    return this.repository.find({
      where: whereClause,
      order: { updatedAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<Terms | null> {
    return this.repository.findOne({ where: { id } });
  }

  async create(data: { type: TermsType; title: string; content: string; isActive?: boolean }): Promise<Terms> {
    const terms = this.repository.create({
      type: data.type,
      title: data.title,
      content: data.content,
      isActive: data.isActive ?? true,
    });
    return this.repository.save(terms);
  }

  async update(id: number, data: { title?: string; content?: string; isActive?: boolean }): Promise<Terms | null> {
    const terms = await this.findById(id);
    if (!terms) {
      return null;
    }

    if (data.title !== undefined) {
      terms.title = data.title;
    }
    if (data.content !== undefined) {
      terms.content = data.content;
    }
    if (data.isActive !== undefined) {
      terms.isActive = data.isActive;
    }

    terms.updatedAt = new Date();
    await this.repository.save(terms);
    return terms;
  }
}
