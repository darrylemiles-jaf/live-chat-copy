import {
  getQueue,
  getAvailableAgents
} from '../controllers/queueControllers.js'
import { protect } from '../middlewares/authMiddleware.js'

import express from 'express'

const router = express.Router()

router.get('/', protect, getQueue);
router.get('/available-agents', protect, getAvailableAgents);

export default router
