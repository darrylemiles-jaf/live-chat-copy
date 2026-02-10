import {
  getQueue
} from '../controllers/queueControllers.js'

import express from 'express'

const router = express.Router()

// GET /queue - Get all queued chats waiting for agent assignment
router.get('/', getQueue);

export default router
