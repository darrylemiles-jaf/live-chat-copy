import expressAsync from 'express-async-handler';
import messagesServices from '../services/messagesServices.js';

const getMessages = expressAsync(async (req, res) => {
  try {
    const messages = await messagesServices.getMessages(req.query);
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error(`Error Occured: ` + error.message);
    throw new Error(error.message);
  }
});

const createMessage = expressAsync(async (req, res) => {
  try {
    const response = await messagesServices.createMessage(req.body)
    res.status(201).json(response)
  } catch (error) {
    console.error(`Error Occured: ` + error.message);
    throw new Error(error.message);
  }
})

export {
  getMessages,
  createMessage
}