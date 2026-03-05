import {
  emitChatAssigned,
  emitQueueUpdate,
  emitChatStatusUpdate,
  emitQueuePositionUpdate,
  emitUserStatusChange,
} from "../socket/socketHandler.js";
import pool from "../config/db.js";
import notificationServices from "./notificationServices.js";

const notifyQueuePositionUpdates = async () => {
  try {
    const [remainingQueue] = await pool.query(
      `SELECT id, client_id FROM chats
       WHERE agent_id IS NULL AND status = 'queued'
       ORDER BY created_at ASC`,
    );
    remainingQueue.forEach((chat, index) => {
      emitQueuePositionUpdate(chat.client_id, index + 1);
    });
  } catch (error) {
    console.error("⚠️ Failed to notify queue position updates:", error.message);
  }
};

/**
 * Auto-assign the first chat in queue to an available agent
 * 
 * IMPORTANT: This function ALWAYS assigns the first chat in the queue (FIFO - First In, First Out)
 * regardless of the chat_id parameter. This ensures queue order is always respected.
 * 
 * @param {number} chat_id - Optional chat ID (used for validation but first in queue is always prioritized)
 * @returns {Object} Assignment result with assigned chat_id and agent_id
 */
const autoAssignChat = async (chat_id) => {
  try {
    console.log("🔍 Auto-assign request for chat:", chat_id);

    // ALWAYS get the first chat in queue (FIFO - First In, First Out)
    const [firstInQueue] = await pool.query(
      `SELECT id FROM chats 
       WHERE agent_id IS NULL AND status = 'queued' 
       ORDER BY created_at ASC 
       LIMIT 1`
    );

    if (firstInQueue.length === 0) {
      throw new Error("No chats available in queue");
    }

    const prioritizedChatId = firstInQueue[0].id;

    // If a specific chat_id was requested, verify it's the first in queue
    if (chat_id && chat_id !== prioritizedChatId) {
      console.warn(`⚠️ Requested chat ${chat_id} is not first in queue. Prioritizing chat ${prioritizedChatId} instead.`);
    }

    console.log("🎯 Prioritizing first chat in queue:", prioritizedChatId);

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
       LIMIT 1`,
    );

    console.log("👥 Available agents found:", availableAgents.length);

    if (availableAgents.length === 0) {
      throw new Error("You must be available to open a chat");
    }

    const agent_id = availableAgents[0].id;
    console.log(
      "✅ Assigning chat to agent:",
      agent_id,
      availableAgents[0].name,
      "(Active chats:",
      availableAgents[0].active_chats,
      ")",
    );

    await pool.query(
      `UPDATE chats SET agent_id = ?, status = 'active', started_at = NOW() WHERE id = ?`,
      [agent_id, prioritizedChatId],
    );

    await pool.query(`UPDATE users SET status = 'busy' WHERE id = ?`, [
      agent_id,
    ]);

    const [agentRow] = await pool.query(
      "SELECT id, name, role, status FROM users WHERE id = ?",
      [agent_id],
    );
    if (agentRow.length) emitUserStatusChange(agentRow[0]);

    console.log("💼 Agent status updated to busy");

    const [chatDetails] = await pool.query(
      `SELECT c.*, u.name as client_name, u.email as client_email 
       FROM chats c 
       JOIN users u ON c.client_id = u.id 
       WHERE c.id = ?`,
      [prioritizedChatId],
    );

    emitChatAssigned(agent_id, chatDetails[0]);

    emitChatStatusUpdate(prioritizedChatId, "active");

    await notifyQueuePositionUpdates();

    try {
      await notificationServices.createNotification({
        user_id: agent_id,
        type: "chat_assigned",
        message: `New chat assigned from ${chatDetails[0]?.client_name || "a client"}`,
        chat_id: prioritizedChatId,
        reference_id: prioritizedChatId,
      });
    } catch (e) {
      console.error("Failed to create auto-assign notification:", e.message);
    }

    return {
      success: true,
      message: "Chat assigned to available agent (first in queue)",
      agent_id: agent_id,
      agent_name: availableAgents[0].name,
      chat_id: prioritizedChatId,
    };
  } catch (error) {
    console.error("❌ Error in autoAssignChat service:", error.message);
    throw new Error(error.message);
  }
};

/**
 * Manually assign a specific chat to a specific agent
 * 
 * This function bypasses queue order and assigns ANY queued chat to the specified agent.
 * Use this for administrative actions where an admin needs to assign a specific chat.
 * 
 * For automatic queue-based assignment, use autoAssignChat instead.
 * 
 * @param {number} chat_id - The specific chat to assign
 * @param {number} agent_id - The agent to assign the chat to
 * @returns {Object} Assignment result
 */
const manualAssignChat = async (chat_id, agent_id) => {
  try {
    const [agent] = await pool.query(
      `SELECT id, role, status FROM users WHERE id = ? AND role IN ('support', 'admin')`,
      [agent_id],
    );

    if (agent.length === 0) {
      throw new Error("Agent not found or invalid role");
    }

    await pool.query(
      `UPDATE chats SET agent_id = ?, status = 'active', started_at = NOW() WHERE id = ?`,
      [agent_id, chat_id],
    );

    await pool.query(`UPDATE users SET status = 'busy' WHERE id = ?`, [
      agent_id,
    ]);

    const [agentRow] = await pool.query(
      "SELECT id, name, role, status FROM users WHERE id = ?",
      [agent_id],
    );
    if (agentRow.length) emitUserStatusChange(agentRow[0]);

    const [chatDetails] = await pool.query(
      `SELECT c.*, u.name as client_name, u.email as client_email 
       FROM chats c 
       JOIN users u ON c.client_id = u.id 
       WHERE c.id = ?`,
      [chat_id],
    );

    emitChatAssigned(agent_id, chatDetails[0]);

    emitQueueUpdate({
      action: "chat_assigned",
      chatId: chat_id,
      agentId: agent_id,
    });

    emitChatStatusUpdate(chat_id, "active");

    await notifyQueuePositionUpdates();

    try {
      await notificationServices.createNotification({
        user_id: agent_id,
        type: "chat_assigned",
        message: `Chat assigned from ${chatDetails[0]?.client_name || "a client"}`,
        chat_id: chat_id,
        reference_id: chat_id,
      });
    } catch (e) {
      console.error("Failed to create manual-assign notification:", e.message);
    }

    return {
      success: true,
      message: "Chat manually assigned to agent",
      agent_id: agent_id,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const endChat = async (chat_id) => {
  try {
    const [chat] = await pool.query(`SELECT agent_id FROM chats WHERE id = ?`, [
      chat_id,
    ]);

    if (chat.length === 0) {
      throw new Error("Chat not found");
    }

    const agent_id = chat[0].agent_id;

    await pool.query(
      `UPDATE chats SET status = 'ended', ended_at = NOW() WHERE id = ?`,
      [chat_id],
    );

    emitChatStatusUpdate(chat_id, "ended");

    emitQueueUpdate({ action: "chat_ended", chatId: chat_id });

    if (agent_id) {
      const [otherActiveChats] = await pool.query(
        `SELECT COUNT(*) as count FROM chats WHERE agent_id = ? AND status = 'active'`,
        [agent_id],
      );

      if (otherActiveChats[0].count === 0) {
        await pool.query(`UPDATE users SET status = 'available' WHERE id = ?`, [
          agent_id,
        ]);
        const [agentRow] = await pool.query(
          "SELECT id, name, role, status FROM users WHERE id = ?",
          [agent_id],
        );
        if (agentRow.length) emitUserStatusChange(agentRow[0]);
      }
    }

    return {
      success: true,
      message: "Chat ended successfully",
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Escalate a chat from bot/automated replies to a live agent.
 *
 * - Validates that the conversation belongs to the requesting client.
 * - Tries to immediately assign an available agent (least-loaded first).
 * - If no agent is available, marks the chat as 'queued' so the auto-assign
 *   flow can pick it up later, and returns status 'no_agent_available'.
 *
 * @param {string|number} clientId        - client user ID
 * @param {string|number} conversationId  - chat row ID
 * @returns {{ status: 'assigned'|'no_agent_available', agentId?: string, agentName?: string }}
 */
const escalateChat = async (clientId, conversationId) => {
  try {
    // 1. Verify the conversation exists and belongs to this client
    const [chatRows] = await pool.query(
      `SELECT id, status, agent_id, client_id FROM chats WHERE id = ? AND client_id = ?`,
      [conversationId, clientId],
    );

    if (chatRows.length === 0) {
      throw new Error("Conversation not found or access denied");
    }

    const chat = chatRows[0];

    // If already assigned to a live agent there's nothing to escalate
    if (chat.status === "active" && chat.agent_id) {
      const [agentRow] = await pool.query(
        `SELECT id, name FROM users WHERE id = ?`,
        [chat.agent_id],
      );
      return {
        status: "assigned",
        agentId: String(chat.agent_id),
        agentName: agentRow[0]?.name || "Agent",
      };
    }

    // 2. Look for an available agent (least active chats first)
    const [availableAgents] = await pool.query(
      `SELECT u.id, u.name,
              COUNT(c.id) AS active_chats
       FROM users u
       LEFT JOIN chats c ON u.id = c.agent_id AND c.status = 'active'
       WHERE u.role IN ('support', 'admin')
         AND u.status = 'available'
       GROUP BY u.id
       ORDER BY active_chats ASC, u.id ASC
       LIMIT 1`,
    );

    if (availableAgents.length === 0) {
      // Ensure the chat is in the queue so auto-assign can pick it up
      await pool.query(
        `UPDATE chats SET status = 'queued' WHERE id = ? AND status NOT IN ('active','ended')`,
        [conversationId],
      );
      return { status: "no_agent_available" };
    }

    const agent = availableAgents[0];

    // 3. Assign the agent
    await pool.query(
      `UPDATE chats SET agent_id = ?, status = 'active', started_at = NOW() WHERE id = ?`,
      [agent.id, conversationId],
    );

    await pool.query(`UPDATE users SET status = 'busy' WHERE id = ?`, [agent.id]);

    const [agentRowFull] = await pool.query(
      "SELECT id, name, role, status FROM users WHERE id = ?",
      [agent.id],
    );
    if (agentRowFull.length) emitUserStatusChange(agentRowFull[0]);

    const [chatDetails] = await pool.query(
      `SELECT c.*, u.name AS client_name, u.email AS client_email
       FROM chats c
       JOIN users u ON c.client_id = u.id
       WHERE c.id = ?`,
      [conversationId],
    );

    emitChatAssigned(agent.id, chatDetails[0]);
    emitChatStatusUpdate(conversationId, "active");
    await notifyQueuePositionUpdates();

    try {
      await notificationServices.createNotification({
        user_id: agent.id,
        type: "chat_assigned",
        message: `Escalated chat from ${chatDetails[0]?.client_name || "a client"}`,
        chat_id: conversationId,
        reference_id: conversationId,
      });
    } catch (e) {
      console.error("Failed to create escalation notification:", e.message);
    }

    return {
      status: "assigned",
      agentId: String(agent.id),
      agentName: agent.name,
    };
  } catch (error) {
    console.error("❌ Error in escalateChat service:", error.message);
    throw new Error(error.message);
  }
};

export default {
  autoAssignChat,
  manualAssignChat,
  endChat,
  escalateChat,
};

