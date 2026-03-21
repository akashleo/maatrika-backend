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
    // Map frontend field names to backend model field names
    const productData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      quantity: req.body.quantities || [],
      image_url: req.body.imageUrl,
    };
    const newProduct = await Product.create(productData);
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
      // Map frontend field names to backend model field names
      const updateData: any = {};
      if (req.body.name !== undefined) updateData.name = req.body.name;
      if (req.body.description !== undefined) updateData.description = req.body.description;
      if (req.body.price !== undefined) updateData.price = req.body.price;
      if (req.body.quantities !== undefined) updateData.quantity = req.body.quantities;
      if (req.body.imageUrl !== undefined) updateData.image_url = req.body.imageUrl;
      
      await product.update(updateData);
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
