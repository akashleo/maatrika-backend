import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.js';
import Product from './products.js';

interface ReviewAttributes {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  comment: string;
}

interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'id'> {}

class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
  public id!: number;
  public product_id!: number;
  public user_id!: number;
  public rating!: number;
  public comment!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: 'id',
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'reviews',
    sequelize,
  }
);

export default Review;
