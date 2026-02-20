import axiosServices from '../utils/axios';

// Get chats for a specific user (agent or client)
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

// Get messages for a specific chat
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

// Get queue (waiting chats)
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

// Get available agents
export const getAvailableAgents = async () => {
  try {
    const response = await axiosServices.get('/queue/available-agents');
    return response.data;
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }
};

// Send message
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

// Assign chat to agent
export const assignChat = async (chatId, agentId) => {
  try {
    const response = await axiosServices.post('/chats/assign', {
      chat_id: chatId,
      agent_id: agentId
    });
    return response.data;
  } catch (error) {
    console.error('Error assigning chat:', error);
    throw error;
  }
};

// Auto-assign chat
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

// End chat
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

export default {
  getChats,
  getChatMessages,
  getQueue,
  getAvailableAgents,
  sendMessage,
  assignChat,
  autoAssignChat,
  endChat
};
