import axiosServices from '../utils/axios';

export const getChats = async (userId) => {
  try {
    const response = await axiosServices.get('/chats', {
      params: { user_id: userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching chats:', error);
    throw error;
  }
};

export const getChatMessages = async (chatId) => {
  try {
    const response = await axiosServices.get('/messages', {
      params: { chat_id: chatId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw error;
  }
};

export const getQueue = async (limit = 50) => {
  try {
    const response = await axiosServices.get('/queue', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching queue:', error);
    throw error;
  }
};

export const getChatStats = async (userId = null) => {
  try {
    const params = userId ? { user_id: userId } : {};
    const response = await axiosServices.get('/chats/stats', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching chat stats:', error);
    throw error;
  }
};

export const getAvailableAgents = async () => {
  try {
    const response = await axiosServices.get('/queue/available-agents');
    return response.data;
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }
};

export const sendMessage = async (senderId, message, chatId = null) => {
  try {
    const payload = {
      sender_id: senderId,
      message: message.trim()
    };

    if (chatId) {
      payload.chat_id = chatId;
    }

    const response = await axiosServices.post('/messages', payload);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const sendMessageWithAttachment = async (senderId, file, message = '', chatId = null) => {
  try {
    const formData = new FormData();
    formData.append('attachment', file);
    formData.append('sender_id', senderId);

    if (chatId) {
      formData.append('chat_id', chatId);
    }

    if (message.trim()) {
      formData.append('message', message.trim());
    }

    const response = await axiosServices.post('/messages/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading message:', error);
    throw error;
  }
};


export const autoAssignChat = async (chatId) => {
  try {
    const response = await axiosServices.post('/chats/auto-assign', {
      chat_id: chatId
    });
    return response.data;
  } catch (error) {
    console.error('Error auto-assigning chat:', error);
    throw error;
  }
};

export const endChat = async (chatId) => {
  try {
    const response = await axiosServices.post('/chats/end', {
      chat_id: chatId
    });
    return response.data;
  } catch (error) {
    console.error('Error ending chat:', error);
    throw error;
  }
};

// ==============================|| NOTIFICATIONS ||============================== //

export const getNotifications = async (userId, page = 1, limit = 20) => {
  try {
    const response = await axiosServices.get('/notifications', {
      params: { user_id: userId, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const getUnreadNotificationCount = async (userId) => {
  try {
    const response = await axiosServices.get('/notifications/unread-count', {
      params: { user_id: userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId) => {
  try {
    const response = await axiosServices.put(`/notifications/read-all/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const response = await axiosServices.put(`/notifications/read/${notificationId}`, {
      user_id: userId
    });
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export default {
  getChats,
  getChatMessages,
  getQueue,
  getChatStats,
  getAvailableAgents,
  sendMessage,
  sendMessageWithAttachment,
  autoAssignChat,
  endChat,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead
};
