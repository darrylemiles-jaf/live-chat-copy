import expressAsync from 'express-async-handler';
import messagesServices from '../services/messagesServices.js';

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
  createMessage
}