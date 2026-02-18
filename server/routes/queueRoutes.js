import {
  getQueue,
  getAvailableAgents
} from '../controllers/queueControllers.js'

import express from 'express'

const router = express.Router()

// GET /queue - Get all queued chats waiting for agent assignment
router.get('/', getQueue);

// GET /queue/available-agents - Get all available agents
router.get('/available-agents', getAvailableAgents);

export default router
