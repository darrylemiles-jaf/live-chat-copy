import pool from "../config/db.js";
import { emitChatAssigned, emitQueueUpdate, emitChatStatusUpdate, emitQueuePositionUpdate } from "../socket/socketHandler.js";
import notificationServices from "./notificationServices.js";

// Notify all remaining queued clients of their new queue position
const notifyQueuePositionUpdates = async () => {
  try {
    const [remainingQueue] = await pool.query(
      `SELECT id, client_id FROM chats
       WHERE agent_id IS NULL AND status = 'queued'
       ORDER BY created_at ASC`
    );
    remainingQueue.forEach((chat, index) => {
      emitQueuePositionUpdate(chat.client_id, index + 1);
    });
  } catch (error) {
    console.error('⚠️ Failed to notify queue position updates:', error.message);
  }
};

// Auto-assign chat to an available agent
const autoAssignChat = async (chat_id) => {
  try {
    console.log('🔍 Looking for available agents for chat:', chat_id);

    // Find available agents and their current active chat count (for load balancing)
    const [availableAgents] = await pool.query(
      `SELECT u.id, u.name, u.email, 
              COUNT(c.id) as active_chats
       FROM users u
       LEFT JOIN chats c ON u.id = c.agent_id AND c.status = 'active'
       WHERE u.role IN ('support', 'admin') 
       AND u.status = 'available'
       GROUP BY u.id
       ORDER BY active_chats ASC, u.id ASC
       LIMIT 1`
    );

    console.log('👥 Available agents found:', availableAgents.length);

    if (availableAgents.length === 0) {
      throw new Error('No available agents at the moment');
    }

    const agent_id = availableAgents[0].id;
    console.log('✅ Assigning chat to agent:', agent_id, availableAgents[0].name, '(Active chats:', availableAgents[0].active_chats, ')');

    // Assign agent to chat
    await pool.query(
      `UPDATE chats SET agent_id = ?, status = 'active', started_at = NOW() WHERE id = ?`,
      [agent_id, chat_id]
    );

    // Update agent status to busy
    await pool.query(
      `UPDATE users SET status = 'busy' WHERE id = ?`,
      [agent_id]
    );

    console.log('💼 Agent status updated to busy');

    // Get chat details for socket emission
    const [chatDetails] = await pool.query(
      `SELECT c.*, u.name as client_name, u.email as client_email 
       FROM chats c 
       JOIN users u ON c.client_id = u.id 
       WHERE c.id = ?`,
      [chat_id]
    );

    // Emit chat assignment notification to agent
    emitChatAssigned(agent_id, chatDetails[0]);

    // Emit status update to chat room
    emitChatStatusUpdate(chat_id, 'active');

    // Notify remaining queued clients of their updated position
    await notifyQueuePositionUpdates();

    // Create notification for chat assignment
    try {
      await notificationServices.createNotification({
        user_id: agent_id,
        type: 'chat_assigned',
        message: `New chat assigned from ${chatDetails[0]?.client_name || 'a client'}`,
        chat_id: chat_id,
        reference_id: chat_id
      });
    } catch (e) {
      console.error('Failed to create auto-assign notification:', e.message);
    }

    return {
      success: true,
      message: 'Chat assigned to available agent',
      agent_id: agent_id,
      agent_name: availableAgents[0].name
    };
  } catch (error) {
    console.error('❌ Error in autoAssignChat service:', error.message);
    throw new Error(error.message);
  }
}

// Manually assign chat to a specific agent
const manualAssignChat = async (chat_id, agent_id) => {
  try {
    // Verify agent exists and is support or admin
    const [agent] = await pool.query(
      `SELECT id, role, status FROM users WHERE id = ? AND role IN ('support', 'admin')`,
      [agent_id]
    );

    if (agent.length === 0) {
      throw new Error('Agent not found or invalid role');
    }

    // Assign agent to chat
    await pool.query(
      `UPDATE chats SET agent_id = ?, status = 'active', started_at = NOW() WHERE id = ?`,
      [agent_id, chat_id]
    );

    // Update agent status to busy
    await pool.query(
      `UPDATE users SET status = 'busy' WHERE id = ?`,
      [agent_id]
    );

    // Get chat details for socket emission
    const [chatDetails] = await pool.query(
      `SELECT c.*, u.name as client_name, u.email as client_email 
       FROM chats c 
       JOIN users u ON c.client_id = u.id 
       WHERE c.id = ?`,
      [chat_id]
    );

    // Emit chat assignment notification to agent
    emitChatAssigned(agent_id, chatDetails[0]);

    // Emit queue update to all agents
    emitQueueUpdate({ action: 'chat_assigned', chatId: chat_id, agentId: agent_id });

    // Emit status update to chat room
    emitChatStatusUpdate(chat_id, 'active');

    // Notify remaining queued clients of their updated position
    await notifyQueuePositionUpdates();

    // Create notification for manual assignment
    try {
      await notificationServices.createNotification({
        user_id: agent_id,
        type: 'chat_assigned',
        message: `Chat assigned from ${chatDetails[0]?.client_name || 'a client'}`,
        chat_id: chat_id,
        reference_id: chat_id
      });
    } catch (e) {
      console.error('Failed to create manual-assign notification:', e.message);
    }

    return {
      success: true,
      message: 'Chat manually assigned to agent',
      agent_id: agent_id
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

// End chat and update agent availability
const endChat = async (chat_id) => {
  try {
    // Get chat details
    const [chat] = await pool.query(
      `SELECT agent_id FROM chats WHERE id = ?`,
      [chat_id]
    );

    if (chat.length === 0) {
      throw new Error('Chat not found');
    }

    const agent_id = chat[0].agent_id;

    // End the chat
    await pool.query(
      `UPDATE chats SET status = 'ended', ended_at = NOW() WHERE id = ?`,
      [chat_id]
    );

    // Emit status update to chat room
    emitChatStatusUpdate(chat_id, 'ended');

    // Emit queue update
    emitQueueUpdate({ action: 'chat_ended', chatId: chat_id });

    // Check if agent has other active chats
    if (agent_id) {
      const [otherActiveChats] = await pool.query(
        `SELECT COUNT(*) as count FROM chats WHERE agent_id = ? AND status = 'active'`,
        [agent_id]
      );

      // If no other active chats, set agent to available
      if (otherActiveChats[0].count === 0) {
        await pool.query(
          `UPDATE users SET status = 'available' WHERE id = ?`,
          [agent_id]
        );
      }
    }

    return {
      success: true,
      message: 'Chat ended successfully'
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

export default {
  autoAssignChat,
  manualAssignChat,
  endChat
}
