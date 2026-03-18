import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.js';
import Product from './products.js';

interface CartAttributes {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
}

interface CartCreationAttributes extends Optional<CartAttributes, 'id'> {}

class Cart extends Model<CartAttributes, CartCreationAttributes> implements CartAttributes {
  public id!: number;
  public user_id!: number;
  public product_id!: number;
  public quantity!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Cart.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'cart',
    sequelize,
  }
);

export default Cart;
