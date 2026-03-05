import express from 'express';
import { submitRating, getRatingByChatId, getAgentRatings, getLeaderboard } from '../controllers/ratingsControllers.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// POST /ratings — submit a new rating (public: submitted from chat widget)
router.post('/', submitRating);

// GET  /ratings/chat/:chat_id — get rating for a specific chat
router.get('/chat/:chat_id', protect, getRatingByChatId);

// GET  /ratings/agent/:agent_id — get all ratings + stats for an agent
router.get('/agent/:agent_id', protect, getAgentRatings);

// GET  /ratings/leaderboard — top agents by avg rating
router.get('/leaderboard', protect, getLeaderboard);

export default router;
