import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://user:pass@example.com:5432/dbname', {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {},
});

export default sequelize;

