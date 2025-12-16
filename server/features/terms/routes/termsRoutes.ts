import { Router } from 'express';
import { TermsService } from '../application/TermsService';
import { TermsController } from '../controller/TermsController';
import { TypeORMTermsRepository } from '../repository/TypeORMTermsRepository';

const termsRepository = new TypeORMTermsRepository();
const termsService = new TermsService(termsRepository);
const termsController = new TermsController(termsService);

export const termsRoutes = Router();
export const adminTermsRoutes = Router();

termsRoutes.get('/', (req, res) => termsController.getLatestTerms(req, res));

adminTermsRoutes.get('/', (req, res) => termsController.getTermsList(req, res));
adminTermsRoutes.get('/:id', (req, res) => termsController.getTermsById(req, res));
adminTermsRoutes.post('/', (req, res) => termsController.createTerms(req, res));
adminTermsRoutes.put('/:id', (req, res) => termsController.updateTerms(req, res));
