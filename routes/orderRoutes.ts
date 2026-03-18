import { Router } from 'express';
import { getAllOrders, getOrderById, createOrder, updateOrder } from '../controllers/orderController.js';

const router = Router();

router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.put('/:id', updateOrder);

export default router;
