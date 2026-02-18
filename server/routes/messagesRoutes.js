import {
  createMessage
} from '../controllers/messagesControllers.js'
import { messagesValidators } from '../middlewares/validations/messagesValidator.js'

import express from 'express'

const router = express.Router()

router.post('/', createMessage);

export default router