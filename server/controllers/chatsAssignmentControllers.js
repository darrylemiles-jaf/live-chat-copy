import expressAsync from 'express-async-handler';
import chatsAssignmentServices from '../services/chatsAssignmentServices.js';

const escalateChat = expressAsync(async (req, res) => {
  try {
    const { clientId, conversationId } = req.body;

    if (!clientId || !conversationId) {
      return res.status(400).json({
        success: false,
        message: 'clientId and conversationId are required',
      });
    }

    const result = await chatsAssignmentServices.escalateChat(clientId, conversationId);
    res.status(200).json(result);
  } catch (error) {
    console.error(`❌ Escalate chat error: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
});

const autoAssignChat = expressAsync(async (req, res) => {
  try {
    const { chat_id } = req.body;
    console.log('🎯 Auto-assign request received:', { chat_id, body: req.body });

    if (!chat_id) {
      console.log('❌ Missing chat_id in request');
      return res.status(400).json({
        success: false,
        message: 'chat_id is required'
      });
    }

    const result = await chatsAssignmentServices.autoAssignChat(chat_id);
    console.log('✅ Chat assigned successfully:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error(`❌ Auto-assign error: ` + error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

const manualAssignChat = expressAsync(async (req, res) => {
  try {
    const { chat_id, agent_id } = req.body;

    if (!chat_id || !agent_id) {
      return res.status(400).json({
        success: false,
        message: 'chat_id and agent_id are required'
      });
    }

    const result = await chatsAssignmentServices.manualAssignChat(chat_id, agent_id);
    res.status(200).json(result);
  } catch (error) {
    console.error(`Error Occured: ` + error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

const endChat = expressAsync(async (req, res) => {
  try {
    const { chat_id } = req.body;

    if (!chat_id) {
      return res.status(400).json({
        success: false,
        message: 'chat_id is required'
      });
    }

    const result = await chatsAssignmentServices.endChat(chat_id);
    res.status(200).json(result);
  } catch (error) {
    console.error(`Error Occured: ` + error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

export {
  autoAssignChat,
  manualAssignChat,
  endChat,
  escalateChat
}
