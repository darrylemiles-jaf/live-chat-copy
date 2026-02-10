import pool from "../config/db.js";

const getChatsWithMessages = async (user_id, query = {}) => {
  try {
    const { status, limit = 50 } = query;

    // Get user role to determine filtering
    const [userData] = await pool.query(
      `SELECT role FROM users WHERE id = ?`,
      [user_id]
    );

    if (!userData || userData.length === 0) {
      throw new Error('User not found');
    }

    const userRole = userData[0].role;

    let sql = `SELECT * FROM chats WHERE 1=1`;
    const params = [];

    // Filter based on user role
    if (userRole === 'client') {
      sql += ` AND client_id = ?`;
      params.push(user_id);
    } else {
      // Agent or admin - show chats assigned to them
      sql += ` AND agent_id = ?`;
      params.push(user_id);
    }

    if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY updated_at DESC LIMIT ?`;
    params.push(parseInt(limit));

    const [chats] = await pool.query(sql, params);

    // Get messages for each chat
    const chatsWithMessages = await Promise.all(
      chats.map(async (chat) => {
        const [messages] = await pool.query(
          `SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC`,
          [chat.id]
        );

        // Get client info
        const [client] = await pool.query(
          `SELECT id, name, username, email, role FROM users WHERE id = ?`,
          [chat.client_id]
        );

        // Get agent info if assigned
        let agent = null;
        if (chat.agent_id) {
          const [agentData] = await pool.query(
            `SELECT id, name, username, email, role FROM users WHERE id = ?`,
            [chat.agent_id]
          );
          agent = agentData[0] || null;
        }

        return {
          ...chat,
          client: client[0] || null,
          agent: agent,
          messages: messages
        };
      })
    );

    return chatsWithMessages;
  } catch (error) {
    throw new Error(error.message);
  }
}

export default {
  getChatsWithMessages
}