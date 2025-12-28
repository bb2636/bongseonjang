import type { EventDto } from '../domain/Event';

export interface EventRepository {
  findAllActive(): Promise<EventDto[]>;
  findById(id: string): Promise<EventDto | null>;
}
