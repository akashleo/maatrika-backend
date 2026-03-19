import { Router } from 'express';
import {
  getAllFilledCarts,
  getCartByUserId,
  updateCart,
  addCartItem,
  deleteCartItem
} from '../controllers/cartController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Admin routes
router.get('/all', authenticateToken, authorizeRoles('ADMIN'), getAllFilledCarts);

// User routes (admin can also access these via controller checks)
router.get('/:userId', authenticateToken, getCartByUserId);
router.post('/', authenticateToken, authorizeRoles('USER'), addCartItem);
router.put('/:id', authenticateToken, updateCart);
router.delete('/:id', authenticateToken, deleteCartItem);

export default router;
