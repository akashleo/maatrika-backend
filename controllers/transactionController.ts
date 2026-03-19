import { Request, Response } from 'express';
import Transaction from '../models/transactions.js';
import Order from '../models/orders.js';
import { AuthRequest } from '../middleware/auth.js';

// [ADMIN] Get all transactions
export const getAllTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await Transaction.findAll();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error });
  }
};

// [ADMIN/USER] Get transaction by ID - ADMIN can view any, USER can only view their own order's transaction
export const getTransactionById = async (req: AuthRequest, res: Response) => {
  try {
    const transaction = await Transaction.findByPk(String(req.params.id));
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // If not admin, verify transaction belongs to user's order
    if (req.user?.role !== 'ADMIN') {
      const order = await Order.findByPk(transaction.order_id);
      if (order?.user_id !== req.user?.id) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transaction', error });
  }
};

// [ADMIN] Get transactions by order ID
export const getTransactionsByOrderId = async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await Transaction.findAll({
      where: { order_id: req.params.orderId }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions for order', error });
  }
};

// [ADMIN] Create transaction
export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const newTransaction = await Transaction.create(req.body);
    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: newTransaction
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating transaction', error });
  }
};

// [ADMIN] Update transaction
export const updateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const transaction = await Transaction.findByPk(String(req.params.id));
    if (transaction) {
      await transaction.update(req.body);
      res.json({
        message: 'Transaction updated successfully',
        transaction
      });
    } else {
      res.status(404).json({ message: 'Transaction not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating transaction', error });
  }
};

// [ADMIN] Delete transaction
export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const transaction = await Transaction.findByPk(String(req.params.id));
    if (transaction) {
      await transaction.destroy();
      res.json({ message: 'Transaction deleted successfully' });
    } else {
      res.status(404).json({ message: 'Transaction not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transaction', error });
  }
};
