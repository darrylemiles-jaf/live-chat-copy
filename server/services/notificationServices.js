import pool from "../db.js";

const getNotifications = async (query = {}) => {
  try {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Number(query.limit) || 10, 50);
    const offset = (page - 1) * limit;

    const filters = [];
    const values = [];

    if (query.user_id) {
      filters.push("user_id = ?");
      values.push(Number(query.user_id));
    }

    if (query.is_read !== undefined) {
      filters.push("is_read = ?");
      values.push(query.is_read ? 1 : 0);
    }

    if (query.from_date && query.to_date) {
      filters.push("created_at BETWEEN ? AND ?");
      values.push(query.from_date, query.to_date);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM notifications ${whereClause}`,
      values,
    );

    const total = countRows[0]?.total || 0;

    const [rows] = await pool.query(
      `
      SELECT 
        id,
        user_id,
        type,
        message,
        is_read,
        created_at
      FROM notifications
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
      `,
      [...values, limit, offset],
    );

    return {
      success: true,
      message: total
        ? "Notifications fetched successfully"
        : "No notifications found",
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("[NotificationService] getNotifications:", error);
    throw new Error("Failed to fetch notifications");
  }
};

export default {
  getNotifications,
};
