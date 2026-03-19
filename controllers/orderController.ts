import { Request, Response } from 'express';
import Order from '../models/orders.js';
import User from '../models/user.js';
import { AuthRequest } from '../middleware/auth.js';

// [ADMIN] Get all orders
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.findAll();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};

// [ADMIN/USER] Get order by ID - ADMIN can view any, USER can only view their own
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findByPk(String(req.params.id));
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is ADMIN or order owner
    if (req.user?.role !== 'ADMIN' && order.user_id !== req.user?.id) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error });
  }
};

// [ADMIN] Get orders by user ID
export const getOrdersByUserId = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.params.userId }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders for user', error });
  }
};

// [USER] Place order - user creates their own order
export const placeOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { total_amount, status } = req.body;
    const newOrder = await Order.create({
      user_id: req.user!.id,
      order_date: new Date(),
      total_amount,
      status: status || 'PENDING'
    });
    res.status(201).json({
      message: 'Order placed successfully',
      order: newOrder
    });
  } catch (error) {
    res.status(500).json({ message: 'Error placing order', error });
  }
};

// [ADMIN] Create order (for any user)
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const newOrder = await Order.create(req.body);
    res.status(201).json({
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error });
  }
};

// [ADMIN] Update order
export const updateOrder = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findByPk(String(req.params.id));
    if (order) {
      await order.update(req.body);
      res.json({
        message: 'Order updated successfully',
        order
      });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error });
  }
};

// [ADMIN] Delete order
export const deleteOrder = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findByPk(String(req.params.id));
    if (order) {
      await order.destroy();
      res.json({ message: 'Order deleted successfully' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error });
  }
};
