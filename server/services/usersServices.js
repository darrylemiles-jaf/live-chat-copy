import { generateUserToken } from "../utils/jwtUtils.js";
import pool from "../config/db.js";
import axios from "axios";
import bcrypt from "bcryptjs";
import { API_VALIDATOR_URL } from "../constants/constants.js";
import { emitUserStatusChange } from "../socket/socketHandler.js";

const getUsers = async (query = {}) => {
  try {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    let whereClauses = [];
    let values = [];
    if (query.role) {
      whereClauses.push("role = ?");
      values.push(query.role);
    }
    if (query.username) {
      whereClauses.push("username LIKE ?");
      values.push(`%${query.username}%`);
    }
    if (query.email) {
      whereClauses.push("email LIKE ?");
      values.push(`%${query.email}%`);
    }

    const where = whereClauses.length
      ? `WHERE ${whereClauses.join(" AND ")}`
      : "";

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as count FROM users ${where}`,
      values,
    );
    const total = countRows[0].count;

    const [users] = await pool.query(
      `SELECT 
      id,
      username,
      email,
      name,
      phone,
      role,
      status
      FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset],
    );

    return {
      success: true,
      message: "Users fetched successfully",
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getSingleUser = async (id) => {
  try {
    const [users] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    if (users.length === 0) {
      return {
        success: false,
        message: "User not found",
        data: null,
      };
    }
    return {
      success: true,
      message: "User fetched successfully",
      data: users[0],
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getUserByEmail = async (email) => {
  try {
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0) {
      return {
        success: false,
        message: "User not found",
        data: null,
      };
    }
    return {
      success: true,
      message: "User fetched successfully",
      data: users[0],
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const validateIfExists = async (email) => {
  try {
    const response = await axios.get(
      API_VALIDATOR_URL,
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
      [email],
    );

    return rows.length > 0;
  } catch (error) {
    console.error("Database error:", error.message);
    throw new Error("Failed to validate user");
  }
};

const createUser = async (userData) => {
  try {
    const {
      name,
      username,
      email,
      phone,
      role,
      status = "AVAILABLE",
      password,
    } = userData;

    const hashedPassword = await bcrypt.hash(password, 10);

    const [insertResult] = await pool.query(
      `INSERT INTO users (name, username, email, phone, role, status, password, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        name,
        username,
        email,
        phone || null,
        role || "user",
        status || "active",
        hashedPassword,
      ],
    );

    const [newUser] = await pool.query("SELECT * FROM users WHERE id = ?", [
      insertResult.insertId,
    ]);

    return {
      data: newUser[0],
    };
  } catch (error) {
    console.error("Create user error:", error.message);
    throw new Error(error.message);
  }
};

const authUser = async (email, password) => {
  // Validate email is provided
  if (!email) {
    return {
      statusCode: 400,
      success: false,
      message: "Email is required",
    };
  }

  try {
    // Fetch user from external API
    const response = await axios.get(API_VALIDATOR_URL);
    const apiUser = response.data?.users?.find((u) => u.email === email);

    // If user doesn't exist in external API, deny access
    if (!apiUser) {
      return {
        statusCode: 404,
        success: false,
        message: "User does not exist. Please contact your administrator.",
      };
    }

    // Check if user exists in local database
    const existsInUsersDB = await validateIfUserExistsInUsersDB(email);

    let userId;

    // Create or update user in local database
    if (!existsInUsersDB) {
      // Create new user in local DB
      const DEFAULT_PASSWORD = "SecurePass123";
      const newUser = await createUser({
        name: apiUser.name,
        username: apiUser.username || apiUser.email.split("@")[0],
        email: apiUser.email,
        phone: apiUser.phone || null,
        role: apiUser.role || "support",
        status: "available",
        password: DEFAULT_PASSWORD,
      });
      userId = newUser.data.id;
    } else {
      // Get existing user
      const user = await getUserByEmail(email);
      userId = user.data.id;

      // Update user status to available
      await pool.query("UPDATE users SET status = ? WHERE id = ?", [
        "available",
        userId,
      ]);
    }

    // Fetch updated user data
    const [userData] = await pool.query(
      "SELECT id, name, username, email, phone, role, status FROM users WHERE id = ?",
      [userId],
    );

    // Emit status change via socket
    emitUserStatusChange(userData[0]);

    // Generate JWT token
    const token = generateUserToken(userData[0]);

    return {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: userData[0],
      token,
    };
  } catch (error) {
    console.error("Authentication error:", error.message);
    return {
      statusCode: 500,
      success: false,
      message: "Authentication failed. Please try again.",
    };
  }
};

const VALID_STATUSES = ["available", "busy", "away"];

const updateUserStatus = async (id, status) => {
  if (!status || !VALID_STATUSES.includes(status)) {
    return {
      success: false,
      message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
    };
  }
  try {
    const [existing] = await pool.query(
      "SELECT id, role FROM users WHERE id = ?",
      [Number(id)],
    );
    if (!existing.length) {
      return { success: false, message: "User not found" };
    }

    if (["support", "admin"].includes(existing[0].role) && status !== "busy") {
      const [activeChats] = await pool.query(
        `SELECT COUNT(*) as count FROM chats WHERE agent_id = ? AND status = 'active'`,
        [Number(id)],
      );
      if (activeChats[0].count > 0) {
        return {
          success: false,
          message: "Cannot change status while handling active chats",
        };
      }
    }
    await pool.query("UPDATE users SET status = ? WHERE id = ?", [
      status,
      Number(id),
    ]);
    const [rows] = await pool.query(
      "SELECT id, name, username, email, phone, role, status FROM users WHERE id = ?",
      [Number(id)],
    );

    const { emitUserStatusChange } = await import("../socket/socketHandler.js");
    emitUserStatusChange(rows[0]);

    return {
      success: true,
      message: "User status updated successfully",
      data: rows[0],
    };
  } catch (error) {
    console.error("Update user status error:", error.message);
    throw new Error(error.message);
  }
};

export default {
  getUsers,
  getSingleUser,
  getUserByEmail,
  validateIfExists,
  validateIfUserExistsInUsersDB,
  createUser,
  authUser,
  updateUserStatus,
};
