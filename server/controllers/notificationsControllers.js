import expressAsync from 'express-async-handler';
import notificationServices from '../services/notificationServices.js';

// GET /notifications?user_id=&is_read=&page=&limit=
const getNotifications = expressAsync(async (req, res) => {
  try {
    const result = await notificationServices.getNotifications(req.query);
    res.status(200).json(result);
  } catch (error) {
    console.error(`Error Occurred: ` + error.message);
    throw new Error(error.message);
  }
});

// GET /notifications/unread-count?user_id=
const getUnreadCount = expressAsync(async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      res.status(400);
      throw new Error('user_id is required');
    }
    const result = await notificationServices.getUnreadCount(user_id);
    res.status(200).json(result);
  } catch (error) {
    console.error(`Error Occurred: ` + error.message);
    throw new Error(error.message);
  }
});

// PUT /notifications/read-all/:userId
const markAllAsRead = expressAsync(async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400);
      throw new Error('userId is required');
    }
    const result = await notificationServices.markAllAsRead(userId);
    res.status(200).json(result);
  } catch (error) {
    console.error(`Error Occurred: ` + error.message);
    throw new Error(error.message);
  }
});

// PUT /notifications/read/:id  (body: { user_id })
const markAsRead = expressAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    if (!id || !user_id) {
      res.status(400);
      throw new Error('id and user_id are required');
    }
    const result = await notificationServices.markAsRead(id, user_id);
    res.status(200).json(result);
  } catch (error) {
    console.error(`Error Occurred: ` + error.message);
    throw new Error(error.message);
  }
});

export { getNotifications, getUnreadCount, markAllAsRead, markAsRead };
