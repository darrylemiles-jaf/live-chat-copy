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

router.get('/', getChats);

router.get('/stats', getChatStats);
router.get('/detailed-stats', getDetailedStats);

router.post('/auto-assign', autoAssignChat);

router.post('/assign', manualAssignChat);

router.post('/end', endChat);

router.post('/escalate', escalateChat);

export default router
