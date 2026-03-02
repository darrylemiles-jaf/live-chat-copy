import pool from "../config/db.js";
import { emitNotification } from "../socket/socketHandler.js";

// Create a notification and emit it via socket.
// For new_message type: upsert — update the existing notification for the same chat
// so there is only ever ONE notification per chat instead of one per message.
const createNotification = async ({ user_id, type, message, chat_id = null, reference_id = null }) => {
  try {
    let notificationId;

    if (type === 'new_message' && chat_id) {
      // Check for an existing notification for this user + chat
      const [existing] = await pool.query(
        `SELECT id FROM notifications WHERE user_id = ? AND type = 'new_message' AND chat_id = ? LIMIT 1`,
        [user_id, chat_id]
      );

      if (existing.length > 0) {
        // Update the existing notification with the latest message and mark unread
        await pool.query(
          `UPDATE notifications SET message = ?, is_read = 0, reference_id = ?, created_at = NOW() WHERE id = ?`,
          [message, reference_id, existing[0].id]
        );
        notificationId = existing[0].id;
      } else {
        const [result] = await pool.query(
          `INSERT INTO notifications (user_id, type, message, chat_id, reference_id) VALUES (?, ?, ?, ?, ?)`,
          [user_id, type, message, chat_id, reference_id]
        );
        notificationId = result.insertId;
      }
    } else {
      const [result] = await pool.query(
        `INSERT INTO notifications (user_id, type, message, chat_id, reference_id) VALUES (?, ?, ?, ?, ?)`,
        [user_id, type, message, chat_id, reference_id]
      );
      notificationId = result.insertId;
    }

    const [rows] = await pool.query(
      `SELECT * FROM notifications WHERE id = ?`,
      [notificationId]
    );

    const notification = rows[0];

    // Emit real-time notification to the user
    emitNotification(user_id, notification);

    return notification;
  } catch (error) {
    console.error("[NotificationService] createNotification:", error);
    throw new Error("Failed to create notification");
  }
};

const getNotifications = async (query = {}) => {
  try {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Number(query.limit) || 20, 50);
    const offset = (page - 1) * limit;

    const filters = [];
    const values = [];

    if (query.user_id) {
      filters.push("user_id = ?");
      values.push(Number(query.user_id));
    }

    if (query.is_read !== undefined) {
      filters.push("is_read = ?");
      values.push(query.is_read === 'true' || query.is_read === true ? 1 : 0);
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

    // Count unread for this user
    let unreadCount = 0;
    if (query.user_id) {
      const [unreadRows] = await pool.query(
        `SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = 0`,
        [Number(query.user_id)]
      );
      unreadCount = unreadRows[0]?.unread || 0;
    }

    const [rows] = await pool.query(
      `
      SELECT 
        id,
        user_id,
        type,
        message,
        is_read,
        chat_id,
        reference_id,
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
      unread_count: unreadCount,
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

// Mark all notifications as read for a specific user
const markAllAsRead = async (userId) => {
  try {
    const [result] = await pool.query(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`,
      [Number(userId)]
    );

    return {
      success: true,
      message: `${result.affectedRows} notification(s) marked as read`,
      affected: result.affectedRows
    };
  } catch (error) {
    console.error("[NotificationService] markAllAsRead:", error);
    throw new Error("Failed to mark notifications as read");
  }
};

// Mark a single notification as read
const markAsRead = async (notificationId, userId) => {
  try {
    const [result] = await pool.query(
      `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
      [Number(notificationId), Number(userId)]
    );

    return {
      success: true,
      message: result.affectedRows ? "Notification marked as read" : "Notification not found",
      affected: result.affectedRows
    };
  } catch (error) {
    console.error("[NotificationService] markAsRead:", error);
    throw new Error("Failed to mark notification as read");
  }
};

// Get unread count for a user
const getUnreadCount = async (userId) => {
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = 0`,
      [Number(userId)]
    );

    return {
      success: true,
      unread_count: rows[0]?.unread || 0
    };
  } catch (error) {
    console.error("[NotificationService] getUnreadCount:", error);
    throw new Error("Failed to get unread count");
  }
};

export default {
  createNotification,
  getNotifications,
  markAllAsRead,
  markAsRead,
  getUnreadCount,
};
