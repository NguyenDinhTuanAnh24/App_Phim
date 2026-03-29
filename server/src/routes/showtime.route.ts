import { Router } from 'express';
import * as showtimeController from '../controllers/showtime.controller';

const router = Router();

router.get('/:id', showtimeController.getShowtimeById);
// Tạm thời để public, sau này sẽ có auth middleware bổ sung cho optional/required auth user id
router.get('/:id/seats', showtimeController.getShowtimeSeats);

export default router;
