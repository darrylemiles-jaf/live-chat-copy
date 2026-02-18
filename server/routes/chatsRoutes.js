import {
  getChats
} from '../controllers/chatsControllers.js'
import {
  autoAssignChat,
  manualAssignChat,
  endChat
} from '../controllers/chatsAssignmentControllers.js'

import express from 'express'

const router = express.Router()

// GET /chats - Get all chats with their messages for a specific user
router.get('/', getChats);

// POST /chats/auto-assign - Auto-assign chat to available agent
router.post('/auto-assign', autoAssignChat);

// POST /chats/assign - Manually assign chat to specific agent
router.post('/assign', manualAssignChat);

// POST /chats/end - End a chat and update agent availability
router.post('/end', endChat);

export default router
