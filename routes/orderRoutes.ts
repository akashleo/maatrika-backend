import { Router } from 'express';
import {
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  placeOrder,
  createOrder,
  updateOrder,
  deleteOrder
} from '../controllers/orderController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Admin routes
router.get('/', authenticateToken, authorizeRoles('ADMIN'), getAllOrders);
router.get('/user/:userId', authenticateToken, authorizeRoles('ADMIN'), getOrdersByUserId);
router.post('/admin', authenticateToken, authorizeRoles('ADMIN'), createOrder);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), updateOrder);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteOrder);

// User routes
router.get('/:id', authenticateToken, getOrderById);
router.post('/place', authenticateToken, authorizeRoles('USER'), placeOrder);

export default router;
