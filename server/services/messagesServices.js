import pool from "../config/db.js";
import { emitNewMessage, emitChatAssigned, emitQueueUpdate, emitStatsUpdate } from "../socket/socketHandler.js";
import notificationServices from "./notificationServices.js";


const getMessages = async (query = {}) => {
  try {
    const { chat_id, sender_id, limit = 100 } = query;

    let sql = `SELECT m.*, u.name as sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE 1=1`;
    const params = [];

    if (chat_id) {
      sql += ` AND m.chat_id = ?`;
      params.push(chat_id);
    }

    if (sender_id) {
      sql += ` AND m.sender_id = ?`;
      params.push(sender_id);
    }

    sql += ` ORDER BY m.created_at ASC LIMIT ?`;
    params.push(parseInt(limit));

    const [messages] = await pool.query(sql, params);

    return messages;
  } catch (error) {
    throw new Error(error.message);
  }
}

const createMessage = async (payload) => {
  try {
    const {
      chat_id,
      sender_id,
      message,
      attachment_url = null,
      attachment_type = null,
      attachment_name = null,
      attachment_size = null
    } = payload || {}

    let usedChatId = chat_id;
    let newlyAssignedAgentId = null;
    let isQueued = false;
    let isNewChat = false;
    let queuePosition = null;

    const sender = await pool.query(`SELECT role FROM users WHERE id = ?`, [sender_id])
    const sender_role = sender[0][0]?.role;

    if (!chat_id) {
      if (sender_role === 'client') {
        const [existingChat] = await pool.query(
          `SELECT * FROM chats WHERE client_id = ? AND status IN ('queued', 'active') LIMIT 1`,
          [sender_id]
        );

        if (existingChat.length > 0) {
          usedChatId = existingChat[0].id;
        } else {
          // Create new chat and add to queue
          const [chatResult] = await pool.query(
            `INSERT INTO chats (client_id, agent_id, status) VALUES (?, NULL, 'queued')`,
            [sender_id]
          );
          usedChatId = chatResult.insertId;
          isNewChat = true;

          console.log(`📝 New chat created: ${usedChatId} for client ${sender_id}`);

          // Find available agent with least active chats (load balancing)
          const [availableAgents] = await pool.query(
            `SELECT u.id, COUNT(c.id) as active_chats
             FROM users u
             LEFT JOIN chats c ON u.id = c.agent_id AND c.status = 'active'
             WHERE u.role IN ('support', 'admin') 
             AND u.status = 'available'
             GROUP BY u.id
             ORDER BY active_chats ASC, u.id ASC
             LIMIT 1`
          );

          if (availableAgents.length > 0) {
            // ⚠️ CRITICAL: Assign the FIRST chat in queue, NOT the newly created one!
            // This ensures FIFO (First In, First Out) queue order is always respected
            const [firstInQueue] = await pool.query(
              `SELECT id, client_id FROM chats 
               WHERE agent_id IS NULL AND status = 'queued' 
               ORDER BY created_at ASC 
               LIMIT 1`
            );

            if (firstInQueue.length > 0) {
              const chatToAssign = firstInQueue[0].id;
              const assignedAgentId = availableAgents[0].id;

              await pool.query(
                `UPDATE chats SET agent_id = ?, status = 'active', started_at = NOW() WHERE id = ?`,
                [assignedAgentId, chatToAssign]
              );

              await pool.query(
                `UPDATE users SET status = 'busy' WHERE id = ?`,
                [assignedAgentId]
              );

              console.log(`✅ Auto-assigned FIRST chat in queue (${chatToAssign}) to agent ${assignedAgentId}`);

              // Only set newlyAssignedAgentId if THIS chat was assigned
              if (chatToAssign === usedChatId) {
                newlyAssignedAgentId = assignedAgentId;
                console.log(`🎯 Newly created chat ${usedChatId} was first in queue and got assigned`);
              } else {
                console.log(`⏳ Newly created chat ${usedChatId} is queued (older chat ${chatToAssign} was assigned first)`);
              }

              // Emit assignment for the chat that was actually assigned
              const [chatDetails] = await pool.query(
                `SELECT c.*, u.name as client_name, u.email as client_email 
                 FROM chats c 
                 JOIN users u ON c.client_id = u.id 
                 WHERE c.id = ?`,
                [chatToAssign]
              );
              if (chatDetails.length > 0) {
                emitChatAssigned(assignedAgentId, chatDetails[0]);
                emitQueueUpdate({ action: 'chat_assigned', chatId: chatToAssign, agentId: assignedAgentId });
              }
            }
          }

          // Calculate queue position for the newly created chat
          const [queueRows] = await pool.query(
            `SELECT COUNT(*) as position FROM chats
             WHERE status = 'queued' AND agent_id IS NULL AND id <= ?`,
            [usedChatId]
          );

          const position = queueRows[0]?.position || 0;
          if (position > 0) {
            isQueued = true;
            queuePosition = position;
            // Emit queue update so UI refreshes with new chat
            emitQueueUpdate({ action: 'new_chat', chatId: usedChatId, position: queuePosition });
          }
        }
      } else {
        const [queuedChats] = await pool.query(
          `SELECT * FROM chats WHERE agent_id IS NULL AND status = 'queued' ORDER BY created_at ASC LIMIT 1`
        );

        if (queuedChats.length > 0) {
          usedChatId = queuedChats[0].id;
          await pool.query(
            `UPDATE chats SET agent_id = ?, status = 'active', started_at = NOW() WHERE id = ?`,
            [sender_id, usedChatId]
          );
          await pool.query(
            `UPDATE users SET status = 'busy' WHERE id = ?`,
            [sender_id]
          );
        } else {
          throw new Error('No available chats in queue to respond to');
        }
      }
    } else {
      // Agent is responding to a specific chat
      if (sender_role === 'support' || sender_role === 'admin') {
        const [chat] = await pool.query(`SELECT * FROM chats WHERE id = ?`, [chat_id]);

        if (chat.length > 0 && chat[0].agent_id === null) {
          // ⚠️ IMPORTANT: Agent is trying to pick up an unassigned chat
          // This should ONLY be allowed via manualAssignChat or autoAssignChat
          // to ensure queue order is respected
          console.warn(`⚠️ Agent ${sender_id} tried to pick up unassigned chat ${chat_id} via message - should use assignment endpoint`);

          // Allow it but log a warning - in production you might want to block this
          await pool.query(
            `UPDATE chats SET agent_id = ?, status = 'active', started_at = NOW() WHERE id = ?`,
            [sender_id, chat_id]
          );
          await pool.query(
            `UPDATE users SET status = 'busy' WHERE id = ?`,
            [sender_id]
          );
        }
      }
    }

    const [result] = await pool.query(
      `INSERT INTO messages (chat_id, sender_id, sender_role, message, attachment_url, attachment_type, attachment_name, attachment_size) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [usedChatId, sender_id, sender_role, message, attachment_url, attachment_type, attachment_name, attachment_size]
    );

    const [newMessage] = await pool.query(
      `SELECT m.*, u.name as sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.id = ?`, [result.insertId]
    );

    // Emit new message event to chat room + agent's personal room (for list refresh when they haven't opened the chat)
    const [chatRow] = await pool.query(`SELECT agent_id FROM chats WHERE id = ?`, [usedChatId]);
    const chatAgentId = chatRow[0]?.agent_id || null;
    // Only notify the agent via personal room if the message is from a client (avoids double-delivery)
    const notifyAgentId = sender_role === 'client' ? chatAgentId : null;
    emitNewMessage(usedChatId, newMessage[0], notifyAgentId);

    // When an agent replies, update dashboard stats in real time
    if (sender_role === 'support' || sender_role === 'admin') {
      emitStatsUpdate();
    }

    // Notify assigned agent of new message from client
    if (sender_role === 'client' && chatAgentId) {
      const senderName = newMessage[0].sender_name || 'A client';
      const lastMsg = newMessage[0].message;
      const msgPreview = lastMsg ? (lastMsg.length > 50 ? lastMsg.substring(0, 50) + '...' : lastMsg) : 'sent an attachment';
      try {
        await notificationServices.createNotification({
          user_id: chatAgentId,
          type: 'new_message',
          message: `${senderName}: ${msgPreview}`,
          chat_id: usedChatId,
          reference_id: newMessage[0].id
        });
      } catch (e) {
        console.error('Failed to create message notification:', e.message);
      }
    }

    if (newlyAssignedAgentId) {
      const [chatDetails] = await pool.query(
        `SELECT c.*, u.name as client_name, u.email as client_email 
         FROM chats c 
         JOIN users u ON c.client_id = u.id 
         WHERE c.id = ?`,
        [usedChatId]
      );

      emitChatAssigned(newlyAssignedAgentId, {
        ...chatDetails[0],
        last_message: newMessage[0].message
      });
      emitQueueUpdate({ action: 'chat_assigned', chatId: usedChatId, agentId: newlyAssignedAgentId });

      // Create notification for chat assignment
      try {
        await notificationServices.createNotification({
          user_id: newlyAssignedAgentId,
          type: 'chat_assigned',
          message: `New chat assigned from ${chatDetails[0]?.client_name || 'a client'}`,
          chat_id: usedChatId,
          reference_id: usedChatId
        });
      } catch (e) {
        console.error('Failed to create assignment notification:', e.message);
      }
    } else if (isQueued) {
      // New chat in queue with no agent — notify all portal users so their list refreshes
      emitQueueUpdate({ action: 'new_chat_queued', chatId: usedChatId });
    }

    // Notify ALL support/admin users whenever a brand-new chat is created
    if (isNewChat) {
      try {
        const [clientRows] = await pool.query(
          `SELECT u.name FROM chats c JOIN users u ON c.client_id = u.id WHERE c.id = ?`,
          [usedChatId]
        );
        const clientName = clientRows[0]?.name || 'A customer';
        const [allAgents] = await pool.query(
          `SELECT id FROM users WHERE role IN ('support', 'admin')`
        );
        for (const agent of allAgents) {
          await notificationServices.createNotification({
            user_id: agent.id,
            type: 'queue_new',
            message: `${clientName} has joined the queue`,
            chat_id: usedChatId,
            reference_id: usedChatId
          });
        }
        console.log(`🔔 Notified ${allAgents.length} agents: ${clientName} joined queue (chat #${usedChatId})`);
      } catch (e) {
        console.error('Failed to create new-chat notifications:', e.message);
      }
    }

    return {
      success: true,
      data: newMessage[0],
      chat_id: usedChatId,
      is_queued: isQueued,
      queue_position: queuePosition
    };

  } catch (error) {
    throw new Error(error.message);
  }
}

export default {
  getMessages,
  createMessage
}