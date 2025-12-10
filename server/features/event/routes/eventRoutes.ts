import { Router } from 'express';
import { EventController } from '../controller/EventController';
import { EventService } from '../application/EventService';
import { TypeORMEventRepository } from '../repository/TypeORMEventRepository';

const router = Router();

const eventRepository = new TypeORMEventRepository();
const eventService = new EventService(eventRepository);
const eventController = new EventController(eventService);

router.get('/', (req, res) => eventController.getActiveEvents(req, res));

export default router;
