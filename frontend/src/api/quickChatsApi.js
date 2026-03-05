import axiosServices from '../utils/axios';

export const getQuickChats = async () => {
  const response = await axiosServices.get('/quick-chats');
  return response.data;
};

export const getQuickChatById = async (id) => {
  const response = await axiosServices.get(`/quick-chats/${id}`);
  return response.data;
};

export const createQuickChat = async ({ title, response }) => {
  const res = await axiosServices.post('/quick-chats', { title, response });
  return res.data;
};

export const updateQuickChat = async (id, { title, response }) => {
  const res = await axiosServices.put(`/quick-chats/${id}`, { title, response });
  return res.data;
};

export const deleteQuickChat = async (id) => {
  const res = await axiosServices.delete(`/quick-chats/${id}`);
  return res.data;
};
