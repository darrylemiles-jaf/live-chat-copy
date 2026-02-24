import mysql from 'mysql2';
import dotenv from 'dotenv';
import { colours } from '../constants/constants.js';

dotenv.config();

const isDev = process.env.NODE_ENV === 'development';

const dbConfig = {
  host: isDev ? process.env.DB_HOST_LOCAL : process.env.DB_HOST,
  user: isDev ? process.env.DB_USER_LOCAL : process.env.DB_USER,
  password: isDev ? process.env.DB_PASSWORD_LOCAL : process.env.DB_PASSWORD,
  database: isDev ? process.env.DB_NAME_LOCAL : process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Ensure the database exists before creating the pool
const ensureDatabase = async () => {
  const { database, ...configWithoutDb } = dbConfig;

  // Connect without a database selected
  const tempConn = mysql.createConnection(configWithoutDb).promise();
  try {
    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    console.log(colours.fg.blue, `✅ Database "${database}" is ready (created if not existed)`, colours.reset);
  } finally {
    await tempConn.end();
  }
};

// Run once at startup — top-level await works because server.js is an ES module
await ensureDatabase();

const pool = mysql.createPool(dbConfig).promise();

(async () => {
  try {
    await pool.getConnection();
    console.log(colours.fg.blue, `Successfully connected to the MySQL database: ${dbConfig.database}`);
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
