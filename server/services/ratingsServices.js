import pool from '../config/db.js';

const submitRating = async ({ chat_id, client_id, rating, comment }) => {
  // Verify the chat exists, is ended, and belongs to this client
  const [chats] = await pool.query(
    `SELECT id, agent_id, client_id, status FROM chats WHERE id = ? AND client_id = ?`,
    [chat_id, client_id]
  );

  if (!chats.length) {
    throw new Error('Chat not found or does not belong to this user');
  }

  const chat = chats[0];

  if (chat.status !== 'ended') {
    throw new Error('You can only rate a chat that has ended');
  }

  if (!chat.agent_id) {
    throw new Error('No agent was assigned to this chat');
  }

  // Check if already rated
  const [existing] = await pool.query(
    `SELECT id FROM ratings WHERE chat_id = ?`,
    [chat_id]
  );

  if (existing.length) {
    throw new Error('This chat has already been rated');
  }

  const [result] = await pool.query(
    `INSERT INTO ratings (chat_id, client_id, agent_id, rating, comment)
     VALUES (?, ?, ?, ?, ?)`,
    [chat_id, client_id, chat.agent_id, rating, comment || null]
  );

  const [inserted] = await pool.query(
    `SELECT r.*, 
            u_client.name AS client_name,
            u_agent.name  AS agent_name
     FROM ratings r
     JOIN users u_client ON u_client.id = r.client_id
     JOIN users u_agent  ON u_agent.id  = r.agent_id
     WHERE r.id = ?`,
    [result.insertId]
  );

  return inserted[0];
};

const getRatingByChatId = async (chat_id) => {
  const [rows] = await pool.query(
    `SELECT r.*, 
            u_client.name AS client_name,
            u_agent.name  AS agent_name
     FROM ratings r
     JOIN users u_client ON u_client.id = r.client_id
     JOIN users u_agent  ON u_agent.id  = r.agent_id
     WHERE r.chat_id = ?`,
    [chat_id]
  );
  return rows[0] || null;
};

const getAgentRatings = async (agent_id) => {
  const [rows] = await pool.query(
    `SELECT r.*,
            u_client.name AS client_name,
            c.started_at,
            c.ended_at
     FROM ratings r
     JOIN users u_client ON u_client.id = r.client_id
     JOIN chats c        ON c.id        = r.chat_id
     WHERE r.agent_id = ?
     ORDER BY r.created_at DESC`,
    [agent_id]
  );

  const [stats] = await pool.query(
    `SELECT 
       COUNT(*) AS total_ratings,
       ROUND(AVG(rating), 2) AS average_rating,
       SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS five_star,
       SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS four_star,
       SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS three_star,
       SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS two_star,
       SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS one_star
     FROM ratings WHERE agent_id = ?`,
    [agent_id]
  );

  return { ratings: rows, stats: stats[0] };
};

const getLeaderboard = async (limit = 10) => {
  const [rows] = await pool.query(
    `SELECT
       u.id,
       u.name,
       u.email,
       COUNT(r.id)            AS total_ratings,
       ROUND(AVG(r.rating), 2) AS average_rating,
       SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) AS five_star,
       SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) AS four_star,
       SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) AS three_star,
       SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) AS two_star,
       SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) AS one_star
     FROM users u
     JOIN ratings r ON r.agent_id = u.id
     WHERE u.role IN ('support', 'admin')
     GROUP BY u.id, u.name, u.email
     HAVING total_ratings > 0
     ORDER BY average_rating DESC, total_ratings DESC
     LIMIT ?`,
    [parseInt(limit)]
  );
  return rows;
};

export default { submitRating, getRatingByChatId, getAgentRatings, getLeaderboard };
