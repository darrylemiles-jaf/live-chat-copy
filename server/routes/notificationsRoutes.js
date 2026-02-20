import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead
} from '../controllers/notificationsControllers.js';

import express from 'express';

const router = express.Router();

// GET /notifications - Get notifications (filter by user_id, is_read, etc.)
router.get('/', getNotifications);

// GET /notifications/unread-count?user_id= - Get unread count for a user
router.get('/unread-count', getUnreadCount);

// PUT /notifications/read-all/:userId - Mark all notifications as read for a user
router.put('/read-all/:userId', markAllAsRead);

// PUT /notifications/read/:id - Mark a single notification as read
router.put('/read/:id', markAsRead);

export default router;
