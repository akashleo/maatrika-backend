import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  signup,
  login,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { authenticateToken, authorizeRoles, authorizeOwnerOrAdmin } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes - Admin only
router.get('/', authenticateToken, authorizeRoles('ADMIN'), getAllUsers);
router.post('/', authenticateToken, authorizeRoles('ADMIN'), createUser);
router.get('/:id', authenticateToken, authorizeOwnerOrAdmin('id'), getUserById);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), updateUser);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteUser);

export default router;
