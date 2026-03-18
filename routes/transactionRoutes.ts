import { Router } from 'express';
import { getAllTransactions, getTransactionById } from '../controllers/transactionController.js';

const router = Router();

router.get('/', getAllTransactions);
router.get('/:id', getTransactionById);

export default router;
