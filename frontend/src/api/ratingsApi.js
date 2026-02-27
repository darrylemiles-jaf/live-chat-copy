import axiosServices from '../utils/axios';

export const getRatingsLeaderboard = async (limit = 10) => {
  try {
    const response = await axiosServices.get('/ratings/leaderboard', { params: { limit } });
    return response.data;
  } catch (error) {
    console.error('Error fetching ratings leaderboard:', error);
    throw error;
  }
};

export const getAgentRatings = async (agentId) => {
  try {
    const response = await axiosServices.get(`/ratings/agent/${agentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching agent ratings:', error);
    throw error;
  }
};

export const getRatingByChatId = async (chatId) => {
  try {
    const response = await axiosServices.get(`/ratings/chat/${chatId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat rating:', error);
    throw error;
  }
};
