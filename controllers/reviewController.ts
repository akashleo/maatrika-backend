import { Request, Response } from 'express';
import Review from '../models/reviews.js';
import Product from '../models/products.js';
import User from '../models/user.js';
import { AuthRequest } from '../middleware/auth.js';

// [ADMIN] View all reviews
export const viewAllReviews = async (req: AuthRequest, res: Response) => {
  try {
    const reviews = await Review.findAll({
      include: [
        { model: Product, attributes: ['id', 'name'] },
        { model: User, attributes: ['id', 'username', 'first_name', 'last_name'] }
      ]
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error });
  }
};

// [ADMIN/USER] View reviews by product - accessible to all authenticated users
export const viewReviewsByProduct = async (req: AuthRequest, res: Response) => {
  try {
    const reviews = await Review.findAll({
      where: { product_id: req.params.productId },
      include: [
        { model: User, attributes: ['id', 'username', 'first_name', 'last_name'] }
      ]
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews for product', error });
  }
};

// [USER] Create review
export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { product_id, rating, comment } = req.body;
    const newReview = await Review.create({
      user_id: req.user!.id,
      product_id,
      rating,
      comment
    });
    res.status(201).json({
      message: 'Review created successfully',
      review: newReview
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error });
  }
};

// [ADMIN/USER] Update review - ADMIN can update any, USER can only update their own
export const updateReview = async (req: AuthRequest, res: Response) => {
  try {
    const review = await Review.findByPk(String(req.params.id));
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user is ADMIN or review owner
    if (req.user?.role !== 'ADMIN' && review.user_id !== req.user?.id) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    await review.update(req.body);
    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error });
  }
};

// [ADMIN/USER] Delete review - ADMIN can delete any, USER can only delete their own
export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const review = await Review.findByPk(String(req.params.id));
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user is ADMIN or review owner
    if (req.user?.role !== 'ADMIN' && review.user_id !== req.user?.id) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    await review.destroy();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error });
  }
};

// Alias exports for backward compatibility
export const getReviewsForProduct = viewReviewsByProduct;
