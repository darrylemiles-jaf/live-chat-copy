import pool from "../config/db.js";

const getUsers = async (query = {}) => {
  try {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    let whereClauses = [];
    let values = [];
    if (query.role) {
      whereClauses.push('role = ?');
      values.push(query.role);
    }
    if (query.username) {
      whereClauses.push('username LIKE ?');
      values.push(`%${query.username}%`);
    }
    if (query.email) {
      whereClauses.push('email LIKE ?');
      values.push(`%${query.email}%`);
    }

    const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [countRows] = await pool.query(`SELECT COUNT(*) as count FROM users ${where}`, values);
    const total = countRows[0].count;

    const [users] = await pool.query(
      `SELECT * FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    return {
      success: true,
      message: 'Users fetched successfully',
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getSingleUser = async (id) => {
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return {
        success: false,
        message: 'User not found',
        data: null
      };
    }
    return {
      success: true,
      message: 'User fetched successfully',
      data: users[0]
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export default {
  getUsers,
  getSingleUser
};