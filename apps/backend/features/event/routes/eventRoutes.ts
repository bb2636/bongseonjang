import { Router } from 'express';
import { EventController } from '../controller/EventController.js';
import { EventService } from '../application/EventService.js';

const router = Router();

const eventService = new EventService();
const eventController = new EventController(eventService);

router.get('/', eventController.getActiveEvents.bind(eventController));
router.get('/:id', eventController.getEventById.bind(eventController));

export default router;
