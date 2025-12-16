import type { EventDto } from '../domain/Event';
import type { EventRepository } from '../repository/EventRepository';

export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async getActiveEvents(): Promise<EventDto[]> {
    return this.eventRepository.findAllActive();
  }
}
