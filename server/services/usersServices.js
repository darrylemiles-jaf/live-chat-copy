import pool from "../config/db.js";
import axios from "axios";
import bcrypt from "bcryptjs";
import { generateUserToken } from "../utils/jwtUtils.js";

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
      `SELECT 
      id,
      username,
      email,
      name,
      phone,
      profile_picture,
      role,
      status
      FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
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

const getUserByEmail = async (email) => {
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
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

const validateIfExists = async (email) => {
  try {
    const response = await axios.get(
      "https://api-staging-admin.timora.ph/api/users/all"
    );

    const data = response.data;

    const userExists = data?.users.find((user) => user.email === email);

    return !!userExists;
  } catch (error) {
    console.error("Error validating user:", error.message);
    throw new Error("Failed to validate user");
  }
};

const validateIfUserExistsInUsersDB = async (email) => {
  try {
    const [rows] = await pool.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    return rows.length > 0;
  } catch (error) {
    console.error("Database error:", error.message);
    throw new Error("Failed to validate user");
  }
};



const createUser = async (userData) => {
  try {
    const { name, username, email, phone, profile_picture, role, status = 'AVAILABLE', password } = userData;


    const hashedPassword = await bcrypt.hash(password, 10);

    const [insertResult] = await pool.query(
      `INSERT INTO users (name, username, email, phone, profile_picture, role, status, password, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [name, username, email, phone || null, profile_picture || null, role || 'user', status || 'active', hashedPassword]
    );

    const [newUser] = await pool.query(
      "SELECT * FROM users WHERE id = ?",
      [insertResult.insertId]
    );

    return {
      data: newUser[0]
    };

  } catch (error) {
    console.error("Create user error:", error.message);
    throw new Error(error.message);
  }
};

const authUser = async (email, password) => {
  if (!email) {
    return {
      statusCode: 400,
      success: false,
      message: "Email is required"
    };
  }

  if (!password) {
    return {
      statusCode: 400,
      success: false,
      message: "Password is required"
    };
  }

  const existsInAPI = await validateIfExists(email);

  if (!existsInAPI) {
    return {
      statusCode: 404,
      success: false,
      message: "User not found in API"
    };
  }

  const existsInUsersDB = await validateIfUserExistsInUsersDB(email);

  if (!existsInUsersDB) {
    const response = await axios.get(
      "https://api-staging-admin.timora.ph/api/users/all"
    );

    const DEFAULT_PASSWORD = "SecurePass123"

    const apiUser = response.data?.users?.find((u) => u.email === email);

    if (apiUser) {
      const newUser = await createUser({
        name: apiUser.name,
        username: apiUser.username || apiUser.email.split("@")[0],
        email: apiUser.email,
        phone: apiUser.phone || null,
        profile_picture: apiUser.profile_picture || null,
        role: apiUser.role || "support",
        status: apiUser.status || "available",
        password: DEFAULT_PASSWORD,
      });

      // Verify password matches the default
      const isPasswordValid = await bcrypt.compare(password, newUser.data.password);

      if (!isPasswordValid) {
        return {
          statusCode: 401,
          success: false,
          message: "Invalid email or password"
        };
      }

      const token = generateUserToken(newUser.data);

      // Remove password from user data before sending
      const { password: _, ...userWithoutPassword } = newUser.data;

      return {
        statusCode: 201,
        success: true,
        message: "User created successfully",
        data: userWithoutPassword,
        token
      };
    }
  }

  // User exists, validate password
  const user = await getUserByEmail(email);

  if (!user.success) {
    return {
      statusCode: 401,
      success: false,
      message: "Invalid email or password"
    };
  }

  // Compare password
  const isPasswordValid = await bcrypt.compare(password, user.data.password);

  if (!isPasswordValid) {
    return {
      statusCode: 401,
      success: false,
      message: "Invalid email or password"
    };
  }

  const token = generateUserToken(user.data);

  // Remove password from user data before sending
  const { password: _, ...userWithoutPassword } = user.data;

  return {
    statusCode: 200,
    success: true,
    message: "Success login",
    data: userWithoutPassword,
    token
  };
};

export default {
  getUsers,
  getSingleUser,
  getUserByEmail,
  validateIfExists,
  validateIfUserExistsInUsersDB,
  createUser,
  authUser
};