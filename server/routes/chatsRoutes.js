import {
  getChats
} from '../controllers/chatsControllers.js'
import {
  autoAssignChat,
  manualAssignChat,
  endChat,
  escalateChat,
} from '../controllers/chatsAssignmentControllers.js'
import {
  getChatStats,
  getDetailedStats
} from '../controllers/chatStatsControllers.js'
import { protect } from '../middlewares/authMiddleware.js'

import express from 'express'

const router = express.Router()

router.get('/', protect, getChats);

router.get('/stats', protect, getChatStats);
router.get('/detailed-stats', protect, getDetailedStats);

router.post('/auto-assign', protect, autoAssignChat);

router.post('/assign', protect, manualAssignChat);

router.post('/end', protect, endChat);

router.post('/escalate', protect, escalateChat);

export default router
