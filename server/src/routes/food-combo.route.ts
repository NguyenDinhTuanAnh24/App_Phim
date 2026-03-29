import express from 'express';
import { getAllFoodCombos } from '../controllers/food-combo.controller';

const router = express.Router();

// Get all available food combos
router.get('/', getAllFoodCombos);

export default router;