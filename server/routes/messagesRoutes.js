import {
  getMessages,
  createMessage,
  createMessageWithAttachment
} from '../controllers/messagesControllers.js'
import { messagesValidators } from '../middlewares/validations/messagesValidator.js'
import upload from '../config/cloudinary.js'

import express from 'express'

const router = express.Router()

// GET /messages - Get messages by chat_id or sender_id
router.get('/', getMessages);

// POST /messages - Create a new message (JSON body)
router.post('/', createMessage);

// POST /messages/upload - Create a message with file attachment (multipart/form-data)
router.post('/upload', upload.single('attachment'), createMessageWithAttachment);

export default router