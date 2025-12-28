import { AppDataSource } from '../../../config/database';
import { Event } from '../../../entity/Event';
import type { EventDto } from '../domain/Event';
import type { EventRepository } from './EventRepository';
import { toAbsoluteImageUrl } from '../../../common/utils/imageUrl.js';

export class TypeORMEventRepository implements EventRepository {
  async findAllActive(): Promise<EventDto[]> {
    const eventRepository = AppDataSource.getRepository(Event);
    
    const now = new Date();
    
    const events = await eventRepository
      .createQueryBuilder('event')
      .where('event.isActive = :isActive', { isActive: true })
      .andWhere('(event.startDate IS NULL OR event.startDate <= :now)', { now })
      .andWhere('(event.endDate IS NULL OR event.endDate >= :now)', { now })
      .orderBy('event.sortOrder', 'ASC')
      .getMany();

    return events.map((event) => this.toDto(event));
  }

  async findById(id: string): Promise<EventDto | null> {
    const eventRepository = AppDataSource.getRepository(Event);
    
    const event = await eventRepository.findOne({
      where: { id, isActive: true }
    });

    if (!event) {
      return null;
    }

    return this.toDto(event);
  }

  private toDto(event: Event): EventDto {
    return {
      id: event.id,
      title: event.title,
      description: event.description ?? undefined,
      imageUrl: toAbsoluteImageUrl(event.imageUrl),
      linkUrl: event.linkUrl ?? undefined,
      startDate: event.startDate?.toISOString(),
      endDate: event.endDate?.toISOString(),
    };
  }
}
