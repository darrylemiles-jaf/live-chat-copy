import pool from "../config/db.js";

const getMessages = async (query = {}) => {
  try {
    const { chat_id, sender_id, limit = 100 } = query;

    let sql = `SELECT * FROM messages WHERE 1=1`;
    const params = [];

    if (chat_id) {
      sql += ` AND chat_id = ?`;
      params.push(chat_id);
    }

    if (sender_id) {
      sql += ` AND sender_id = ?`;
      params.push(sender_id);
    }

    sql += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(parseInt(limit));

    const [messages] = await pool.query(sql, params);

    return messages;
  } catch (error) {
    throw new Error(error.message);
  }
}

const createMessage = async (payload) => {
  try {
    const {
      chat_id,
      sender_id,
      message
    } = payload || {}

    let usedChatId = chat_id;

    const sender = await pool.query(`SELECT role FROM users WHERE id = ?`, [sender_id])
    const sender_role = sender[0][0]?.role;

    // If no chat_id provided, find or create a chat
    if (!chat_id) {
      if (sender_role === 'client') {
        // Client: Can only have ONE active or queued chat at a time
        const [existingChat] = await pool.query(
          `SELECT * FROM chats WHERE client_id = ? AND status IN ('queued', 'active') LIMIT 1`,
          [sender_id]
        );

        if (existingChat.length > 0) {
          // Reuse existing chat - client can only have one
          usedChatId = existingChat[0].id;
        } else {
          // Create new chat with agent_id null (queued for agent assignment)
          const [chatResult] = await pool.query(
            `INSERT INTO chats (client_id, agent_id, status) VALUES (?, NULL, 'queued')`,
            [sender_id]
          );
          usedChatId = chatResult.insertId;
        }
      } else {
        // Agent/Admin: Can handle MULTIPLE active chats
        // When agent sends message without chat_id, pick oldest queued chat
        const [queuedChats] = await pool.query(
          `SELECT * FROM chats WHERE agent_id IS NULL AND status = 'queued' ORDER BY created_at ASC LIMIT 1`
        );

        if (queuedChats.length > 0) {
          usedChatId = queuedChats[0].id;
          // Assign agent and activate chat
          await pool.query(
            `UPDATE chats SET agent_id = ?, status = 'active', started_at = NOW() WHERE id = ?`,
            [sender_id, usedChatId]
          );
          // Update agent status to busy
          await pool.query(
            `UPDATE users SET status = 'busy' WHERE id = ?`,
            [sender_id]
          );
        } else {
          throw new Error('No available chats in queue to respond to');
        }
      }
    } else {
      // If chat_id provided and sender is agent, assign them if not already assigned
      if (sender_role === 'support_agent' || sender_role === 'admin') {
        const [chat] = await pool.query(`SELECT * FROM chats WHERE id = ?`, [chat_id]);

        if (chat.length > 0 && chat[0].agent_id === null) {
          // Assign agent to chat
          await pool.query(
            `UPDATE chats SET agent_id = ?, status = 'active', started_at = NOW() WHERE id = ?`,
            [sender_id, chat_id]
          );
          // Update agent status to busy
          await pool.query(
            `UPDATE users SET status = 'busy' WHERE id = ?`,
            [sender_id]
          );
        }
      }
    }

    const [result] = await pool.query(
      `INSERT INTO messages (chat_id, sender_id, sender_role, message) VALUES (?, ?, ?, ?)`, [usedChatId, sender_id, sender_role, message]
    );

    // Fetch the newly created message
    const [newMessage] = await pool.query(
      `SELECT * FROM messages WHERE id = ?`, [result.insertId]
    );

    return {
      success: true,
      data: newMessage[0],
      chat_id: usedChatId
    };

  } catch (error) {
    throw new Error(error.message);
  }
}

export default {
  getMessages,
  createMessage
}