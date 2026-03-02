import {
  getQueue,
  getAvailableAgents
} from '../controllers/queueControllers.js'
import { protect } from '../middlewares/authMiddleware.js'

import express from 'express'

const router = express.Router()

router.use(protect)
router.get('/', getQueue);
router.get('/available-agents', getAvailableAgents);

export default router
