import express from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  createBookingController,
  createPaymentUrlController,
  getBookingByIdController,
  getUserBookingsController,
} from '../controllers/booking.controller';
import { validate } from '../middlewares/validate';
import { createBookingSchema } from '../validators/booking.validator';
import { getAllFoodCombos } from '../controllers/food-combo.controller';

const router = express.Router();

// Public route to get food combos
router.get('/food-combos', getAllFoodCombos);

// Booking routes (require authentication)
router.post('/', authenticate, validate(createBookingSchema), createBookingController);
router.get('/my', authenticate, getUserBookingsController);
router.get('/:id', authenticate, getBookingByIdController);
router.post('/:id/payment-url', authenticate, createPaymentUrlController);

export default router;