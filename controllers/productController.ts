import { Request, Response } from 'express';
import Product from '../models/products.js';
import { AuthRequest } from '../middleware/auth.js';

// [ADMIN/USER] Get all products - accessible to all authenticated users
export const getAllProducts = async (req: AuthRequest, res: Response) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

// [ADMIN/USER] Get product by ID - accessible to all authenticated users
export const getProductById = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findByPk(String(req.params.id));
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
};

// [ADMIN] Add new product
export const addNewProduct = async (req: AuthRequest, res: Response) => {
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
};

// [ADMIN] Update product
export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findByPk(String(req.params.id));
    if (product) {
      await product.update(req.body);
      res.json({
        message: 'Product updated successfully',
        product
      });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
  }
};

// [ADMIN] Remove product
export const removeProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findByPk(String(req.params.id));
    if (product) {
      await product.destroy();
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
};

// [ADMIN] Create product (alias for addNewProduct)
export const createProduct = addNewProduct;

// [ADMIN] Delete product (alias for removeProduct)
export const deleteProduct = removeProduct;
