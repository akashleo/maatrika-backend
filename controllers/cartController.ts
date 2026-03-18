import { Request, Response } from 'express';
import Cart from '../models/cart.js';

export const getCartItems = async (req: Request, res: Response) => {
  try {
    const cartItems = await Cart.findAll({ where: { user_id: req.params.userId } });
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart items', error });
  }
};

export const addCartItem = async (req: Request, res: Response) => {
  try {
    const newCartItem = await Cart.create(req.body);
    res.status(201).json(newCartItem);
  } catch (error) {
    res.status(500).json({ message: 'Error adding cart item', error });
  }
};

export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const cartItem = await Cart.findByPk(req.params.id);
    if (cartItem) {
      await cartItem.update(req.body);
      res.json(cartItem);
    } else {
      res.status(404).json({ message: 'Cart item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart item', error });
  }
};

export const deleteCartItem = async (req: Request, res: Response) => {
  try {
    const cartItem = await Cart.findByPk(req.params.id);
    if (cartItem) {
      await cartItem.destroy();
      res.json({ message: 'Cart item deleted' });
    } else {
      res.status(404).json({ message: 'Cart item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting cart item', error });
  }
};
