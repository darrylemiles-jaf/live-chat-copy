import mysql from 'mysql2/promise';
import { colours } from '../constants/constants.js';

let pool;

const connectDB = async () => {
  try {
    const dbName = process.env.NODE_ENV === 'development'
      ? process.env.DB_NAME_LOCAL
      : process.env.DB_NAME;

    const tempConnection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306
    });

    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(colours.fg.cyan, `Database '${dbName}' checked/created`);
    await tempConnection.end();

    const config = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: dbName,
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

    pool = mysql.createPool(config);

    // Test the connection
    const connection = await pool.getConnection();
    console.log(colours.fg.green, `MySQL Connected: ${dbName}`);
    connection.release();
  } catch (error) {
    console.log(colours.fg.red, `Error: ${error.message}`);
    process.exit(1);
  }
};

export const getPool = () => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call connectDB first.');
  }
  return pool;
};

export default connectDB;
