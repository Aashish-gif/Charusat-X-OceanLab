import express from 'express';
import { calculateBudget } from '../controllers/pricingController.js';

const router = express.Router();

router.post('/calculate', calculateBudget);

export default router;
