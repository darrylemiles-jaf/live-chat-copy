import pool from "../config/db.js";

// Auto-assign chat to an available agent
const autoAssignChat = async (chat_id) => {
  try {
    // Find an available agent (not busy)
    const [availableAgents] = await pool.query(
      `SELECT id FROM users 
       WHERE role IN ('support_agent', 'admin') 
       AND status = 'available' 
       ORDER BY RAND() 
       LIMIT 1`
    );

    if (availableAgents.length === 0) {
      throw new Error('No available agents at the moment');
    }

    const agent_id = availableAgents[0].id;

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

    return {
      success: true,
      message: 'Chat assigned to available agent',
      agent_id: agent_id
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Manually assign chat to a specific agent
const manualAssignChat = async (chat_id, agent_id) => {
  try {
    // Verify agent exists and is support_agent or admin
    const [agent] = await pool.query(
      `SELECT id, role, status FROM users WHERE id = ? AND role IN ('support_agent', 'admin')`,
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
