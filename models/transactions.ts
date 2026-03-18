import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';
import Order from './orders.js';

interface TransactionAttributes {
  id: number;
  order_id: number;
  transaction_date: Date;
  amount: number;
  status: string;
}

interface TransactionCreationAttributes extends Optional<TransactionAttributes, 'id'> {}

class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
  public id!: number;
  public order_id!: number;
  public transaction_date!: Date;
  public amount!: number;
  public status!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Transaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Order,
        key: 'id',
      },
    },
    transaction_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'transactions',
    sequelize,
  }
);

export default Transaction;
