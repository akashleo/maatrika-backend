import { Request, Response } from 'express';
import Cart from '../models/cart.js';
import Product from '../models/products.js';
import { AuthRequest } from '../middleware/auth.js';

// [ADMIN] Get all filled carts (all cart items in the system)
export const getAllFilledCarts = async (req: AuthRequest, res: Response) => {
  try {
    const cartItems = await Cart.findAll({
      include: [
        { model: Product, attributes: ['id', 'name', 'price', 'image_url'] }
      ]
    });
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all cart items', error });
  }
};

// [USER] Get cart by user ID - user can only view their own cart
export const getCartByUserId = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.userId as string);
    
    // Check if user is ADMIN or requesting their own cart
    if (req.user?.role !== 'ADMIN' && req.user?.id !== userId) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      include: [
        { model: Product, attributes: ['id', 'name', 'price', 'image_url'] }
      ]
    });
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart items', error });
  }
};

// [USER] Update cart - user can only update their own cart
export const updateCart = async (req: AuthRequest, res: Response) => {
  try {
    const cartId = parseInt(req.params.id as string);
    const cartItem = await Cart.findByPk(String(cartId));
    
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    // Check if user is ADMIN or updating their own cart
    if (req.user?.role !== 'ADMIN' && cartItem.user_id !== req.user?.id) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    await cartItem.update(req.body);
    res.json({
      message: 'Cart updated successfully',
      cartItem
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart', error });
  }
};

// [USER] Add item to cart
export const addCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const { product_id, quantity } = req.body;
    const newCartItem = await Cart.create({
      user_id: req.user!.id,
      product_id,
      quantity
    });
    res.status(201).json({
      message: 'Item added to cart',
      cartItem: newCartItem
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding cart item', error });
  }
};

// [USER] Delete cart item
export const deleteCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const cartItem = await Cart.findByPk(String(req.params.id));
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    // Check if user is ADMIN or deleting their own cart item
    if (req.user?.role !== 'ADMIN' && cartItem.user_id !== req.user?.id) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    await cartItem.destroy();
    res.json({ message: 'Cart item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting cart item', error });
  }
};

// Alias for deleteCartItem
export const removeCartItem = deleteCartItem;
