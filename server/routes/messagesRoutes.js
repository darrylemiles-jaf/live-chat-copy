import {
  getMessages,
  createMessage
} from '../controllers/messagesControllers.js'
import { messagesValidators } from '../middlewares/validations/messagesValidator.js'

import express from 'express'

const router = express.Router()

// GET /messages - Get messages by chat_id or sender_id
router.get('/', getMessages);

// POST /messages - Create a new message
router.post('/', createMessage);

export default router