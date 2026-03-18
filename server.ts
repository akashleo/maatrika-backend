import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

import userRoutes from './routes/userRoutes.js';

// TODO: Add routes for each model
app.use('/api/users', userRoutes);

import productRoutes from './routes/productRoutes.js';
app.use('/api/products', productRoutes);

import orderRoutes from './routes/orderRoutes.js';
app.use('/api/orders', orderRoutes);

import cartRoutes from './routes/cartRoutes.js';
app.use('/api/cart', cartRoutes);

import reviewRoutes from './routes/reviewRoutes.js';
app.use('/api/reviews', reviewRoutes);

import transactionRoutes from './routes/transactionRoutes.js';
app.use('/api/transactions', transactionRoutes);

sequelize.sync().then(() => {
  console.log('Database connected');
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
