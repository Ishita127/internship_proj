import { Router } from 'express';
import { addReview, getProductReviews } from '../controllers/review.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();
router.get('/:productId', getProductReviews);
router.post('/', protect, addReview);
export default router;