import pool from "../config/db.js";

/**
 * Get chat statistics for the last 7 days
 * @param {number} userId - Optional user ID for personal stats
 * @returns {Object} - Statistics object with daily counts
 */
const getChatStats = async (userId = null) => {
  try {
    // Get last 7 days
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

    const newChatsData = [];
    const closedChatsData = [];

    for (const day of days) {
      // Count new chats for this day
      let newQuery = `SELECT COUNT(*) as count FROM chats WHERE DATE(created_at) = ?`;
      let newParams = [day.date];
      
      if (userId) {
        newQuery += ` AND agent_id = ?`;
        newParams.push(userId);
      }
      
      const [newResult] = await pool.query(newQuery, newParams);
      newChatsData.push(newResult[0].count);

      // Count resolved chats for this day (ended_at is not null)
      let closedQuery = `SELECT COUNT(*) as count FROM chats WHERE ended_at IS NOT NULL AND DATE(ended_at) = ?`;
      let closedParams = [day.date];
      
      if (userId) {
        closedQuery += ` AND agent_id = ?`;
        closedParams.push(userId);
      }
      
      const [closedResult] = await pool.query(closedQuery, closedParams);
      closedChatsData.push(closedResult[0].count);
    }

    // Get weekly totals
    const weekStart = days[0].date;
    const weekEnd = days[6].date;

    let weeklyNewQuery = `SELECT COUNT(*) as count FROM chats WHERE DATE(created_at) BETWEEN ? AND ?`;
    let weeklyNewParams = [weekStart, weekEnd];
    
    if (userId) {
      weeklyNewQuery += ` AND agent_id = ?`;
      weeklyNewParams.push(userId);
    }
    
    const [weeklyNew] = await pool.query(weeklyNewQuery, weeklyNewParams);

    let weeklyClosedQuery = `SELECT COUNT(*) as count FROM chats WHERE ended_at IS NOT NULL AND DATE(ended_at) BETWEEN ? AND ?`;
    let weeklyClosedParams = [weekStart, weekEnd];
    
    if (userId) {
      weeklyClosedQuery += ` AND agent_id = ?`;
      weeklyClosedParams.push(userId);
    }
    
    const [weeklyClosed] = await pool.query(weeklyClosedQuery, weeklyClosedParams);

    return {
      success: true,
      data: {
        days: days.map(d => d.dayName),
        newChats: newChatsData,
        closedChats: closedChatsData,
        weeklyTotal: {
          new: weeklyNew[0].count,
          closed: weeklyClosed[0].count
        }
      }
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export default {
  getChatStats
};
