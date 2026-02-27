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

/**
 * Get detailed statistics for the Statistics Dashboard
 * Includes per-agent rankings, status breakdown, and agent availability
 */
const getDetailedStats = async () => {
  try {
    // --- Status breakdown ---
    const [statusRows] = await pool.query(
      `SELECT status, COUNT(*) AS count FROM chats GROUP BY status`
    );
    const statusMap = { queued: 0, active: 0, ended: 0 };
    statusRows.forEach(r => { statusMap[r.status] = Number(r.count); });

    // --- Total resolved (for percentage) ---
    const totalResolved = statusMap.ended || 1;

    // --- Top agents by resolved chats ---
    // avg_response = average time from each client message to the next agent reply across ALL messages
    const [topAgentRows] = await pool.query(`
      SELECT
        u.id,
        u.name,
        COUNT(DISTINCT c.id)                                            AS resolved,
        AVG(NULLIF(TIMESTAMPDIFF(SECOND, c.started_at, c.ended_at), 0)) AS avg_resolution,
        AVG(
          NULLIF(
            TIMESTAMPDIFF(SECOND, cm.created_at,
              (SELECT MIN(am.created_at) FROM messages am
               WHERE am.chat_id = cm.chat_id
                 AND am.sender_role IN ('support','admin')
                 AND am.created_at > cm.created_at)
            ), 0
          )
        ) AS avg_response
      FROM users u
      JOIN chats c ON c.agent_id = u.id AND c.status = 'ended'
      JOIN messages cm ON cm.chat_id = c.id AND cm.sender_role = 'client'
      GROUP BY u.id, u.name
      ORDER BY resolved DESC
      LIMIT 6
    `);

    const topAgents = topAgentRows.map(a => ({
      id: a.id,
      name: a.name,
      resolved: Number(a.resolved),
      percent: Math.min(100, Math.round((Number(a.resolved) / totalResolved) * 100)),
      avgResolution: Math.round(a.avg_resolution || 0),
      avgResponse: Math.round(a.avg_response || 0)
    }));

    // --- Top clients by chat count ---
    const [topClientRows] = await pool.query(`
      SELECT u.id, u.name, u.email, COUNT(c.id) AS chat_count
      FROM users u
      JOIN chats c ON c.client_id = u.id
      GROUP BY u.id, u.name, u.email
      ORDER BY chat_count DESC
      LIMIT 6
    `);
    const topClients = topClientRows.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      chatCount: Number(c.chat_count)
    }));

    // --- Agent availability ---
    const [agentAvailRows] = await pool.query(
      `SELECT status, COUNT(*) AS count FROM users WHERE role IN ('support','admin') GROUP BY status`
    );
    const avail = { available: 0, busy: 0, away: 0, total: 0 };
    agentAvailRows.forEach(r => {
      const s = r.status;
      if (s in avail) avail[s] = Number(r.count);
      avail.total += Number(r.count);
    });
    const availPercent = avail.total > 0
      ? Math.round((avail.available / avail.total) * 100)
      : 0;

    return {
      success: true,
      data: {
        statusBreakdown: statusMap,
        topAgents,
        topClients,
        agentAvailability: { ...avail, availPercent }
      }
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export default {
  getChatStats,
  getDetailedStats
};
