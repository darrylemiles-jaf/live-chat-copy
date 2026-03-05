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
});

const createMessageWithAttachment = expressAsync(async (req, res) => {
  try {
    // File is uploaded to Cloudinary via multer middleware
    const file = req.file;

    if (!file) {
      res.status(400);
      throw new Error('No file uploaded');
    }

    // Determine attachment type from mimetype
    let attachmentType = 'document';
    if (file.mimetype.startsWith('image/')) {
      attachmentType = 'image';
    } else if (file.mimetype.startsWith('video/')) {
      attachmentType = 'video';
    } else if (file.mimetype.startsWith('audio/')) {
      attachmentType = 'audio';
    } else if (['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'].includes(file.mimetype)) {
      attachmentType = 'archive';
    }

    const payload = {
      chat_id: req.body.chat_id ? parseInt(req.body.chat_id) : null,
      sender_id: parseInt(req.body.sender_id),
      message: req.body.message || null,
      attachment_url: file.path, // Cloudinary URL
      attachment_type: attachmentType,
      attachment_name: file.originalname,
      attachment_size: file.size
    };

    const response = await messagesServices.createMessage(payload);
    res.status(201).json(response);
  } catch (error) {
    console.error(`Error Occured: ` + error.message);
    throw new Error(error.message);
  }
});

export {
  getMessages,
  createMessage,
  createMessageWithAttachment
}