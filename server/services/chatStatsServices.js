import pool from "../config/db.js";

/**
 * Get chat statistics for the last 7 days
 * Uses efficient grouped SQL queries instead of per-day queries
 * @param {number} userId - Optional user ID for personal stats
 * @returns {Object} - Statistics object with daily counts and performance metrics
 */
const getChatStats = async (userId = null) => {
  try {
    // Build date range for last 7 days
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: dayNames[date.getDay()]
      });
    }

    const weekStart = days[0].date;
    const weekEnd = days[6].date;
    const userFilter = userId ? ` AND agent_id = ?` : '';
    const baseParams = userId ? [weekStart, weekEnd, userId] : [weekStart, weekEnd];

    // --- Single query: daily new chats grouped by date ---
    const newChatsQuery = `
      SELECT DATE(created_at) AS day, COUNT(*) AS count
      FROM chats
      WHERE DATE(created_at) BETWEEN ? AND ?${userFilter}
      GROUP BY DATE(created_at)
    `;
    const [newRows] = await pool.query(newChatsQuery, baseParams);

    // --- Single query: daily resolved chats grouped by date ---
    const closedChatsQuery = `
      SELECT DATE(ended_at) AS day, COUNT(*) AS count
      FROM chats
      WHERE ended_at IS NOT NULL AND DATE(ended_at) BETWEEN ? AND ?${userFilter}
      GROUP BY DATE(ended_at)
    `;
    const [closedRows] = await pool.query(closedChatsQuery, baseParams);

    // Map results into per-day arrays
    const newMap = {};
    newRows.forEach(r => {
      const key = new Date(r.day).toISOString().split('T')[0];
      newMap[key] = r.count;
    });

    const closedMap = {};
    closedRows.forEach(r => {
      const key = new Date(r.day).toISOString().split('T')[0];
      closedMap[key] = r.count;
    });

    const newChatsData = days.map(d => newMap[d.date] || 0);
    const closedChatsData = days.map(d => closedMap[d.date] || 0);

    const weeklyNew = newChatsData.reduce((a, b) => a + b, 0);
    const weeklyClosed = closedChatsData.reduce((a, b) => a + b, 0);

    // --- Avg response time: time between chat creation and first agent message ---
    const avgResponseQuery = `
      SELECT AVG(response_seconds) AS avg_response_time FROM (
        SELECT TIMESTAMPDIFF(SECOND, c.created_at, MIN(m.created_at)) AS response_seconds
        FROM chats c
        INNER JOIN messages m ON m.chat_id = c.id AND m.sender_role IN ('support','admin')
        WHERE DATE(c.created_at) BETWEEN ? AND ?${userFilter}
        GROUP BY c.id
      ) AS sub
    `;
    const [avgResponseRows] = await pool.query(avgResponseQuery, baseParams);
    const avgResponseTimeSec = avgResponseRows[0]?.avg_response_time || 0;

    // --- Avg resolution time: time between started_at and ended_at ---
    const avgResolutionQuery = `
      SELECT AVG(TIMESTAMPDIFF(SECOND, started_at, ended_at)) AS avg_resolution_time
      FROM chats
      WHERE ended_at IS NOT NULL AND started_at IS NOT NULL
        AND DATE(ended_at) BETWEEN ? AND ?${userFilter}
    `;
    const [avgResolutionRows] = await pool.query(avgResolutionQuery, baseParams);
    const avgResolutionTimeSec = avgResolutionRows[0]?.avg_resolution_time || 0;

    // --- Active chats right now ---
    let activeQuery = `SELECT COUNT(*) AS count FROM chats WHERE status = 'active'`;
    let activeParams = [];
    if (userId) {
      activeQuery += ` AND agent_id = ?`;
      activeParams.push(userId);
    }
    const [activeRows] = await pool.query(activeQuery, activeParams);

    // --- Queued chats right now ---
    const [queuedRows] = await pool.query(`SELECT COUNT(*) AS count FROM chats WHERE status = 'queued'`);

    // --- Total chats handled (all time for this user, or org) ---
    let totalHandledQuery = `SELECT COUNT(*) AS count FROM chats WHERE status = 'ended'`;
    let totalHandledParams = [];
    if (userId) {
      totalHandledQuery += ` AND agent_id = ?`;
      totalHandledParams.push(userId);
    }
    const [totalHandledRows] = await pool.query(totalHandledQuery, totalHandledParams);

    return {
      success: true,
      data: {
        days: days.map(d => d.dayName),
        newChats: newChatsData,
        closedChats: closedChatsData,
        weeklyTotal: {
          new: weeklyNew,
          closed: weeklyClosed
        },
        avgResponseTime: Math.round(avgResponseTimeSec),
        avgResolutionTime: Math.round(avgResolutionTimeSec),
        activeChats: activeRows[0].count,
        queuedChats: queuedRows[0].count,
        totalResolved: totalHandledRows[0].count
      }
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export default {
  getChatStats
};
