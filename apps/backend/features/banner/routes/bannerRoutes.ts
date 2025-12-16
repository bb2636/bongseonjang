import { Router } from 'express';
import { bannerController } from '../controller/bannerController';

const router = Router();

router.get('/banner-positions', (req, res) => bannerController.getPositions(req, res));
router.get('/banners', (req, res) => bannerController.getBannersByPosition(req, res));
router.get('/banners/:id', (req, res) => bannerController.getBannerById(req, res));
router.post('/banners', (req, res) => bannerController.createBanner(req, res));
router.put('/banners/:id', (req, res) => bannerController.updateBanner(req, res));
router.delete('/banners/:id', (req, res) => bannerController.deleteBanner(req, res));
router.post('/banners/reorder', (req, res) => bannerController.reorderBanners(req, res));

export { router as adminBannerRoutes };
