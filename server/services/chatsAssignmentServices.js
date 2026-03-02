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

const autoAssignChat = async (chat_id) => {
  try {
    console.log("🔍 Looking for available agents for chat:", chat_id);

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
      throw new Error("No available agents at the moment");
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

    console.log("💼 Agent status updated to busy");

    const [chatDetails] = await pool.query(
      `SELECT c.*, u.name as client_name, u.email as client_email 
       FROM chats c 
       JOIN users u ON c.client_id = u.id 
       WHERE c.id = ?`,
      [chat_id],
    );

    emitChatAssigned(agent_id, chatDetails[0]);

    emitChatStatusUpdate(chat_id, "active");

    await notifyQueuePositionUpdates();

    try {
      await notificationServices.createNotification({
        user_id: agent_id,
        type: "chat_assigned",
        message: `New chat assigned from ${chatDetails[0]?.client_name || "a client"}`,
        chat_id: chat_id,
        reference_id: chat_id,
      });
    } catch (e) {
      console.error("Failed to create auto-assign notification:", e.message);
    }

    return {
      success: true,
      message: "Chat assigned to available agent",
      agent_id: agent_id,
      agent_name: availableAgents[0].name,
    };
  } catch (error) {
    console.error("❌ Error in autoAssignChat service:", error.message);
    throw new Error(error.message);
  }
};

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

export default {
  autoAssignChat,
  manualAssignChat,
  endChat,
};
