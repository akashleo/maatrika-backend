import { Router } from 'express';
import { getReviewsForProduct, createReview, updateReview, deleteReview } from '../controllers/reviewController.js';

const router = Router();

router.get('/:productId', getReviewsForProduct);
router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

export default router;
