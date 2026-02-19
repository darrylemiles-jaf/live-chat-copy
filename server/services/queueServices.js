import pool from "../config/db.js";

const getQueue = async (query = {}) => {
  try {
    const { limit = 50 } = query;

    // Get all queued chats without an agent assigned
    const [chats] = await pool.query(
      `SELECT * FROM chats 
       WHERE agent_id IS NULL AND status = 'queued' 
       ORDER BY created_at ASC 
       LIMIT ?`,
      [parseInt(limit)]
    );

    // Get messages and client info for each queued chat
    const queuedChatsWithDetails = await Promise.all(
      chats.map(async (chat) => {
        const [messages] = await pool.query(
          `SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC`,
          [chat.id]
        );

        const [client] = await pool.query(
          `SELECT id, name, username, email, role FROM users WHERE id = ?`,
          [chat.client_id]
        );

        return {
          ...chat,
          client: client[0] || null,
          messages: messages,
          waiting_time: new Date() - new Date(chat.created_at) // Time in queue (milliseconds)
        };
      })
    );

    return queuedChatsWithDetails;
  } catch (error) {
    throw new Error(error.message);
  }
}

const getAvailableAgents = async () => {
  try {
    const [agents] = await pool.query(
      `SELECT id, name, username, email, role, status 
       FROM users 
       WHERE role IN ('support', 'admin') 
       AND status = 'available'
       ORDER BY name ASC`
    );

    return agents;
  } catch (error) {
    throw new Error(error.message);
  }
}

export default {
  getQueue,
  getAvailableAgents
}
