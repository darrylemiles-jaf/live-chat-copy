import {
  getChats
} from '../controllers/chatsControllers.js'

import express from 'express'

const router = express.Router()

// GET /chats - Get all chats with their messages
router.get('/', getChats);

export default router
