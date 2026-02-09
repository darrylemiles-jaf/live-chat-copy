import mysql from 'mysql2';
import dotenv from 'dotenv';
import { colours } from '../constants/constants.js';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.NODE_ENV === 'development' ? process.env.DB_HOST_LOCAL : process.env.DB_HOST,
  user: process.env.NODE_ENV === 'development' ? process.env.DB_USER_LOCAL : process.env.DB_USER,
  password: process.env.NODE_ENV === 'development' ? process.env.DB_PASSWORD_LOCAL : process.env.DB_PASSWORD,
  database: process.env.NODE_ENV === 'development' ? process.env.DB_NAME_LOCAL : process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

(async () => {
  try {
    await pool.getConnection();
    console.log(colours.fg.blue, `Successfully connected to the MySQL database: ${process.env.NODE_ENV === 'development' ? process.env.DB_NAME_LOCAL : process.env.DB_NAME}`);
  } catch (error) {
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error(colours.fg.red, 'Invalid MySQL credentials. Please check your username and password.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(colours.fg.red, 'Database does not exist. Please verify the database name.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error(colours.fg.red, 'Connection refused. Check if your MySQL server is running.');
    } else {
      console.error(colours.fg.red, `Error connecting to the database: ${error.message}`);
    }
    throw new Error(error.message);
  }
})();

export default pool;
