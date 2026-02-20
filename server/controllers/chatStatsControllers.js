import expressAsync from 'express-async-handler';
import chatStatsServices from '../services/chatStatsServices.js';

const getChatStats = expressAsync(async (req, res) => {
  try {
    const { user_id } = req.query;
    const stats = await chatStatsServices.getChatStats(user_id ? parseInt(user_id) : null);
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching chat stats:', error.message);
    throw new Error(error.message);
  }
});

export {
  getChatStats
};
