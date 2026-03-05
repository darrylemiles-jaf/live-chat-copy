import express from 'express';
import {
  getAllQuickChats,
  getQuickChatById,
  createQuickChat,
  updateQuickChat,
  deleteQuickChat
} from '../controllers/quickChatsControllers.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public — widget reads these without auth
router.get('/', getAllQuickChats);
router.get('/:id', getQuickChatById);

// Protected — only authenticated admins/agents manage quick chats
router.post('/', protect, createQuickChat);
router.put('/:id', protect, updateQuickChat);
router.delete('/:id', protect, deleteQuickChat);

export default router;
