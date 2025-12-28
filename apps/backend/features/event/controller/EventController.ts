import type { Request, Response } from 'express';
import type { EventService } from '../application/EventService';

export class EventController {
  constructor(private readonly eventService: EventService) {}

  async getActiveEvents(_req: Request, res: Response): Promise<void> {
    try {
      const events = await this.eventService.getActiveEvents();
      res.json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  }

  async getEventById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const event = await this.eventService.getEventById(id);
      
      if (!event) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }
      
      res.json(event);
    } catch (error) {
      console.error('Error fetching event:', error);
      res.status(500).json({ error: 'Failed to fetch event' });
    }
  }
}
