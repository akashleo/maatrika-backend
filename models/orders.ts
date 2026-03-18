import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';
import User from './user.js';

interface OrderAttributes {
  id: number;
  user_id: number;
  order_date: Date;
  total_amount: number;
  status: string;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, 'id'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public user_id!: number;
  public order_date!: Date;
  public total_amount!: number;
  public status!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
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
    order_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'orders',
    sequelize,
  }
);

export default Order;
