import { Router } from 'express';
import { EventController } from '../controller/EventController.js';
import { EventService } from '../application/EventService.js';

const router = Router();

const eventService = new EventService();
const eventController = new EventController(eventService);

router.get('/', (req, res) => eventController.getActiveEvents(req, res));
router.get('/:id', (req, res) => eventController.getEventById(req, res));

export default router;
