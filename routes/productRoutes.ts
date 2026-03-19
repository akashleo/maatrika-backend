import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  addNewProduct,
  updateProduct,
  removeProduct
} from '../controllers/productController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Routes accessible to all authenticated users
router.get('/', authenticateToken, getAllProducts);
router.get('/:id', authenticateToken, getProductById);

// Admin only routes
router.post('/', authenticateToken, authorizeRoles('ADMIN'), addNewProduct);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), updateProduct);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), removeProduct);

export default router;
