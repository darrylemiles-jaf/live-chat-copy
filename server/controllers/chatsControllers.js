import expressAsync from 'express-async-handler';
import chatsServices from '../services/chatsServices.js';

const getChats = expressAsync(async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    const chats = await chatsServices.getChatsWithMessages(user_id, req.query);
    res.status(200).json({
      success: true,
      count: chats.length,
      data: chats
    });
  } catch (error) {
    console.error(`Error Occured: ` + error.message);
    throw new Error(error.message);
  }
});

export {
  getChats
}
