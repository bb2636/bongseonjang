import type { EventDto } from '../domain/Event';

export interface EventRepository {
  findAllActive(): Promise<EventDto[]>;
}
