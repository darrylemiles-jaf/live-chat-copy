import {
  getChats
} from '../controllers/chatsControllers.js'
import {
  autoAssignChat,
  manualAssignChat,
  endChat
} from '../controllers/chatsAssignmentControllers.js'
import {
  getChatStats
} from '../controllers/chatStatsControllers.js'

import express from 'express'

const router = express.Router()

router.get('/', getChats);

router.get('/stats', getChatStats);

router.post('/auto-assign', autoAssignChat);

router.post('/assign', manualAssignChat);

router.post('/end', endChat);

export default router
