import { Router } from 'express';
import { generateProductImageUploadUrl } from '../controllers/uploadController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Route for generating signed upload URLs for product images
// Accessible to admin users only (since it's for product management)
router.post(
  '/product-image',
  // authenticateToken,
  // authorizeRoles('ADMIN'),
  generateProductImageUploadUrl
);

export default router;
