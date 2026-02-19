import pool from "../config/db.js";
import { emitNewMessage, emitChatAssigned, emitQueueUpdate } from "../socket/socketHandler.js";

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

    if (!chat_id) {
      if (sender_role === 'client') {
        const [existingChat] = await pool.query(
          `SELECT * FROM chats WHERE client_id = ? AND status IN ('queued', 'active') LIMIT 1`,
          [sender_id]
        );

        if (existingChat.length > 0) {
          usedChatId = existingChat[0].id;
        } else {
          const [chatResult] = await pool.query(
            `INSERT INTO chats (client_id, agent_id, status) VALUES (?, NULL, 'queued')`,
            [sender_id]
          );
          usedChatId = chatResult.insertId;

          const [availableAgents] = await pool.query(
            `SELECT id FROM users 
             WHERE role IN ('support_agent', 'admin') 
             AND status = 'available' 
             ORDER BY RAND() 
             LIMIT 1`
          );

          if (availableAgents.length > 0) {
            const assignedAgentId = availableAgents[0].id;

            await pool.query(
              `UPDATE chats SET agent_id = ?, status = 'active', started_at = NOW() WHERE id = ?`,
              [assignedAgentId, usedChatId]
            );

            await pool.query(
              `UPDATE users SET status = 'busy' WHERE id = ?`,
              [assignedAgentId]
            );

            // Emit chat assignment notification to agent
            const [chatDetails] = await pool.query(
              `SELECT c.*, u.name as client_name, u.email as client_email 
               FROM chats c 
               JOIN users u ON c.client_id = u.id 
               WHERE c.id = ?`,
              [usedChatId]
            );
            emitChatAssigned(assignedAgentId, chatDetails[0]);

            // Emit queue update to all agents
            emitQueueUpdate({ action: 'chat_assigned', chatId: usedChatId });
          }
        }
      } else {
        const [queuedChats] = await pool.query(
          `SELECT * FROM chats WHERE agent_id IS NULL AND status = 'queued' ORDER BY created_at ASC LIMIT 1`
        );

        if (queuedChats.length > 0) {
          usedChatId = queuedChats[0].id;
          await pool.query(
            `UPDATE chats SET agent_id = ?, status = 'active', started_at = NOW() WHERE id = ?`,
            [sender_id, usedChatId]
          );
          await pool.query(
            `UPDATE users SET status = 'busy' WHERE id = ?`,
            [sender_id]
          );
        } else {
          throw new Error('No available chats in queue to respond to');
        }
      }
    } else {
      if (sender_role === 'support_agent' || sender_role === 'admin') {
        const [chat] = await pool.query(`SELECT * FROM chats WHERE id = ?`, [chat_id]);

        if (chat.length > 0 && chat[0].agent_id === null) {
          await pool.query(
            `UPDATE chats SET agent_id = ?, status = 'active', started_at = NOW() WHERE id = ?`,
            [sender_id, chat_id]
          );
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

    const [newMessage] = await pool.query(
      `SELECT * FROM messages WHERE id = ?`, [result.insertId]
    );

    // Emit new message event to chat room
    emitNewMessage(usedChatId, newMessage[0]);

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