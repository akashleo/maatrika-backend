import { Router } from 'express';
import {
  viewAllReviews,
  viewReviewsByProduct,
  createReview,
  updateReview,
  deleteReview
} from '../controllers/reviewController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Admin routes
router.get('/all', authenticateToken, authorizeRoles('ADMIN'), viewAllReviews);

// Routes accessible to all authenticated users
router.get('/product/:productId', authenticateToken, viewReviewsByProduct);

// User routes (admin can also access)
router.post('/', authenticateToken, authorizeRoles('USER'), createReview);
router.put('/:id', authenticateToken, updateReview);
router.delete('/:id', authenticateToken, deleteReview);

export default router;
