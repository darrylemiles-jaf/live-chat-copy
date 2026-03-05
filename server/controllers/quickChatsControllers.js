import expressAsync from 'express-async-handler';
import quickChatsServices from '../services/quickChatsServices.js';

// GET /quick-chats — list all (public)
const getAllQuickChats = expressAsync(async (req, res) => {
  const data = await quickChatsServices.getAll();
  res.status(200).json({ success: true, data });
});

// GET /quick-chats/:id — get one (public)
const getQuickChatById = expressAsync(async (req, res) => {
  const { id } = req.params;
  const data = await quickChatsServices.getById(parseInt(id));
  if (!data) {
    return res.status(404).json({ success: false, message: 'Quick chat not found' });
  }
  res.status(200).json({ success: true, data });
});

// POST /quick-chats — create (admin protected)
const createQuickChat = expressAsync(async (req, res) => {
  const { title, response } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }
  if (!response?.trim()) {
    return res.status(400).json({ success: false, message: 'Response is required' });
  }

  const data = await quickChatsServices.create({ title, response });
  res.status(201).json({ success: true, message: 'Quick chat created', data });
});

// PUT /quick-chats/:id — update (admin protected)
const updateQuickChat = expressAsync(async (req, res) => {
  const { id } = req.params;
  const { title, response } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }
  if (!response?.trim()) {
    return res.status(400).json({ success: false, message: 'Response is required' });
  }

  try {
    const data = await quickChatsServices.update(parseInt(id), { title, response });
    res.status(200).json({ success: true, message: 'Quick chat updated', data });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

// DELETE /quick-chats/:id — delete (admin protected)
const deleteQuickChat = expressAsync(async (req, res) => {
  const { id } = req.params;

  try {
    await quickChatsServices.remove(parseInt(id));
    res.status(200).json({ success: true, message: 'Quick chat deleted' });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

export { getAllQuickChats, getQuickChatById, createQuickChat, updateQuickChat, deleteQuickChat };
