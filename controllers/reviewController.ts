import { Request, Response } from 'express';
import Review from '../models/reviews.js';

export const getReviewsForProduct = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.findAll({ where: { product_id: String(req.params.productId) } });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const newReview = await Review.create(req.body);
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.findByPk(String(req.params.id));
    if (review) {
      await review.update(req.body);
      res.json(review);
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.findByPk(String(req.params.id));
    if (review) {
      await review.destroy();
      res.json({ message: 'Review deleted' });
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error });
  }
};
