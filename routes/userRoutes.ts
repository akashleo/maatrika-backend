import { Router } from 'express';
import { getAllUsers, getUserById, createUser, loginUser } from '../controllers/userController.js';

const router = Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.post('/login', loginUser);

export default router;
