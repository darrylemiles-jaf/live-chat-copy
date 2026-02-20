import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const getChats = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/chats`, {
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
    const response = await axios.get(`${API_URL}/messages`, {
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
    const response = await axios.get(`${API_URL}/queue`, {
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
    const response = await axios.get(`${API_URL}/chats/stats`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching chat stats:', error);
    throw error;
  }
};

export const getAvailableAgents = async () => {
  try {
    const response = await axios.get(`${API_URL}/queue/available-agents`);
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

    const response = await axios.post(`${API_URL}/messages`, payload);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const assignChat = async (chatId, agentId) => {
  try {
    const response = await axios.post(`${API_URL}/chats/assign`, {
      chat_id: chatId,
      agent_id: agentId
    });
    return response.data;
  } catch (error) {
    console.error('Error assigning chat:', error);
    throw error;
  }
};

export const autoAssignChat = async (chatId) => {
  try {
    const response = await axios.post(`${API_URL}/chats/auto-assign`, {
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
    const response = await axios.post(`${API_URL}/chats/end`, {
      chat_id: chatId
    });
    return response.data;
  } catch (error) {
    console.error('Error ending chat:', error);
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
  assignChat,
  autoAssignChat,
  endChat
};
