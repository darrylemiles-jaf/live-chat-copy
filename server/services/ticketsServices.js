import pool from "../config/db.js";

const getTickets = async (query = {}) => {
  try {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    let whereClauses = [];
    let values = [];

    if (query.status) {
      whereClauses.push("status = ?");
      values.push(query.status);
    }

    if (query.priority) {
      whereClauses.push("priority = ?");
      values.push(query.priority);
    }

    if (query.search) {
      whereClauses.push("(title LIKE ? OR description LIKE ?)");
      values.push(`%${query.search}%`, `%${query.search}%`);
    }

    const where = whereClauses.length
      ? `WHERE ${whereClauses.join(" AND ")}`
      : "";

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as count FROM tickets ${where}`,
      values,
    );
    const total = countRows[0].count;

    const [tickets] = await pool.query(
      `SELECT * FROM tickets ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset],
    );

    return {
      success: true,
      message: "Tickets fetched successfully",
      data: tickets,
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

const getTicketById = async (id) => {
  try {
    const [tickets] = await pool.query("SELECT * FROM tickets WHERE id = ?", [
      id,
    ]);

    if (tickets.length === 0) {
      return {
        success: false,
        message: "Ticket not found",
        data: null,
      };
    }

    return {
      success: true,
      message: "Ticket fetched successfully",
      data: tickets[0],
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const createTicket = async (payload) => {
  try {
    const {
      title,
      description,
      status = "new",
      priority = "medium",
    } = payload || {};

    if (!title) {
      throw new Error("Title is required");
    }

    const [result] = await pool.query(
      `INSERT INTO tickets (title, description, status, priority) VALUES (?, ?, ?, ?)`,
      [title, description || null, status, priority],
    );

    const [ticket] = await pool.query("SELECT * FROM tickets WHERE id = ?", [
      result.insertId,
    ]);

    return {
      success: true,
      message: "Ticket created successfully",
      data: ticket[0],
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateTicket = async (id, payload) => {
  try {
    const [existingTicket] = await pool.query(
      "SELECT * FROM tickets WHERE id = ?",
      [id],
    );

    if (existingTicket.length === 0) {
      return {
        success: false,
        message: "Ticket not found",
        data: null,
      };
    }

    const { title, description, status, priority } = payload || {};

    let updateFields = [];
    let values = [];

    if (title !== undefined) {
      updateFields.push("title = ?");
      values.push(title);
    }

    if (description !== undefined) {
      updateFields.push("description = ?");
      values.push(description);
    }

    if (status !== undefined) {
      updateFields.push("status = ?");
      values.push(status);
    }

    if (priority !== undefined) {
      updateFields.push("priority = ?");
      values.push(priority);
    }

    if (updateFields.length === 0) {
      return {
        success: false,
        message: "No fields to update",
        data: null,
      };
    }

    values.push(id);

    await pool.query(
      `UPDATE tickets SET ${updateFields.join(", ")} WHERE id = ?`,
      values,
    );

    const [ticket] = await pool.query("SELECT * FROM tickets WHERE id = ?", [
      id,
    ]);

    return {
      success: true,
      message: "Ticket updated successfully",
      data: ticket[0],
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getTicketStats = async () => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COALESCE(SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END), 0) as open,
        COALESCE(SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END), 0) as in_progress,
        COALESCE(SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END), 0) as closed,
        COALESCE(SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END), 0) as priority_low,
        COALESCE(SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END), 0) as priority_medium,
        COALESCE(SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END), 0) as priority_high
      FROM tickets
    `);

    return {
      success: true,
      message: "Ticket statistics fetched successfully",
      data: stats[0],
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export default {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  getTicketStats,
};
