import { AppDataSource } from '../../../config/database';
import { Faq } from '../../../entity';
import type { FaqRepository } from './FaqRepository';

export class TypeORMFaqRepository implements FaqRepository {
  private get repository() {
    return AppDataSource.getRepository(Faq);
  }

  async findAllForAdmin(keyword?: string, categoryId?: number): Promise<Faq[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('faq')
      .leftJoinAndSelect('faq.category', 'category')
      .orderBy('faq.createdAt', 'DESC');

    if (keyword) {
      queryBuilder.andWhere('(faq.title ILIKE :keyword OR faq.content ILIKE :keyword)', { keyword: `%${keyword}%` });
    }

    if (categoryId) {
      queryBuilder.andWhere('faq.categoryId = :categoryId', { categoryId });
    }

    return queryBuilder.getMany();
  }

  async findByIdForAdmin(id: number): Promise<Faq | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  async findAll(keyword?: string, categoryId?: number): Promise<Faq[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('faq')
      .leftJoinAndSelect('faq.category', 'category')
      .where('faq.isVisible = :isVisible', { isVisible: true })
      .orderBy('faq.createdAt', 'DESC');

    if (keyword) {
      queryBuilder.andWhere('(faq.title ILIKE :keyword OR faq.content ILIKE :keyword)', { keyword: `%${keyword}%` });
    }

    if (categoryId) {
      queryBuilder.andWhere('faq.categoryId = :categoryId', { categoryId });
    }

    return queryBuilder.getMany();
  }

  async findById(id: number): Promise<Faq | null> {
    return this.repository.findOne({
      where: { id, isVisible: true },
      relations: ['category'],
    });
  }

  async create(data: { categoryId: number; title: string; content: string; isVisible?: boolean }): Promise<Faq> {
    const faq = this.repository.create({
      categoryId: data.categoryId,
      title: data.title,
      content: data.content,
      isVisible: data.isVisible ?? true,
    });
    return this.repository.save(faq);
  }

  async update(id: number, data: { categoryId?: number; title?: string; content?: string; isVisible?: boolean }): Promise<Faq | null> {
    const faq = await this.findByIdForAdmin(id);
    if (!faq) {
      return null;
    }

    const updateData: Partial<Faq> = {
      updatedAt: new Date(),
    };

    if (data.categoryId !== undefined) {
      updateData.categoryId = data.categoryId;
    }
    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    if (data.content !== undefined) {
      updateData.content = data.content;
    }
    if (data.isVisible !== undefined) {
      updateData.isVisible = data.isVisible;
    }

    await this.repository.update(id, updateData);
    return this.findByIdForAdmin(id);
  }

  async delete(id: number): Promise<boolean> {
    const faq = await this.findByIdForAdmin(id);
    if (!faq) {
      return false;
    }

    faq.isVisible = false;
    await this.repository.save(faq);
    return true;
  }

  async countAll(): Promise<number> {
    return this.repository.count();
  }

  async countVisible(): Promise<number> {
    return this.repository.count({
      where: { isVisible: true },
    });
  }
}
