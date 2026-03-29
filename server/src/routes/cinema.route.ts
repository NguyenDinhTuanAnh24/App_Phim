import { Router } from 'express';
import * as cinemaController from '../controllers/cinema.controller';

const router = Router();

router.get('/cities', cinemaController.getAllCities);
router.get('/', cinemaController.getCinemas);
router.get('/:id/showtimes', cinemaController.getCinemaShowtimes);
router.get('/:id', cinemaController.getCinemaById);

export default router;
