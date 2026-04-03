import express from 'express';
import { getServiceRecommendation } from '../controllers/recommendationController.js';

const router = express.Router();

router.post('/suggest', getServiceRecommendation);

export default router;
