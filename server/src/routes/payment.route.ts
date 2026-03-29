import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller';

const router = Router();

// VNPay callbacks - KHÔNG cần authenticate
router.get('/vnpay/return', bookingController.vnpayReturnController);
router.post('/vnpay/ipn', bookingController.vnpayIPNController);

export default router;
