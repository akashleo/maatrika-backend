import { Router } from 'express';
import {
  getAllTransactions,
  getTransactionById,
  getTransactionsByOrderId,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from '../controllers/transactionController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Admin routes
router.get('/', authenticateToken, authorizeRoles('ADMIN'), getAllTransactions);
router.get('/order/:orderId', authenticateToken, authorizeRoles('ADMIN'), getTransactionsByOrderId);
router.post('/', authenticateToken, authorizeRoles('ADMIN'), createTransaction);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), updateTransaction);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteTransaction);

// User route (can view own transactions via order check in controller)
router.get('/:id', authenticateToken, getTransactionById);

export default router;
