import { Router } from 'express';
import { getCartItems, addCartItem, updateCartItem, deleteCartItem } from '../controllers/cartController.js';

const router = Router();

router.get('/:userId', getCartItems);
router.post('/', addCartItem);
router.put('/:id', updateCartItem);
router.delete('/:id', deleteCartItem);

export default router;
