import { Server } from 'socket.io';
import pool from '../config/db.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    socket.on('join', (userId) => {
      const roomName = `user_${userId}`;
      socket.join(roomName);
      console.log(`👤 User ${userId} joined their personal room: ${roomName} (socket: ${socket.id})`);
      console.log(`   📋 Socket ${socket.id} is now in rooms:`, Array.from(socket.rooms));
    });

    socket.on('join_chat', (chatId) => {
      const roomName = `chat_${chatId}`;
      socket.join(roomName);
      console.log(`💬 Socket ${socket.id} joined ${roomName}`);
      console.log(`   📋 Socket ${socket.id} is now in rooms:`, Array.from(socket.rooms));
    });

    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat_${chatId}`);
      console.log(`👋 Socket ${socket.id} left chat_${chatId}`);
    });

    socket.on('typing', ({ chatId, userName, role }) => {
      console.log(`⌨️ Typing event: chatId=${chatId}, userName=${userName}, role=${role}`);
      const room = `chat_${chatId}`;
      const roomSockets = io.sockets.adapter.rooms.get(room);
      console.log(`   📋 Room ${room} has ${roomSockets ? roomSockets.size : 0} sockets`);
      socket.to(room).emit('user_typing', { userName, role });
    });

    socket.on('stop_typing', ({ chatId }) => {
      console.log(`⌨️ Stop typing: chatId=${chatId}`);
      socket.to(`chat_${chatId}`).emit('user_stop_typing');
    });

    socket.on('mark_messages_read', async ({ chatId, readerRole }) => {
      try {
        const role = readerRole || 'agent';
        const seenAt = new Date().toISOString();

        if (role === 'agent') {
          await pool.query(
            `UPDATE messages SET is_seen = 1 WHERE chat_id = ? AND sender_role = 'client' AND is_seen = 0`,
            [chatId]
          );
          const [latestClientMsg] = await pool.query(
            `SELECT created_at FROM messages WHERE chat_id = ? AND sender_role = 'client' AND is_seen = 1 ORDER BY created_at DESC LIMIT 1`,
            [chatId]
          );
          const resolvedSeenAt = latestClientMsg[0]?.created_at
            ? new Date(latestClientMsg[0].created_at).toISOString()
            : seenAt;
          console.log(`\uD83D\uDC41\uFE0F Agent read client msgs in chat ${chatId}`);
          io.to(`chat_${chatId}`).emit('messages_seen', { chatId, seenAt: resolvedSeenAt });
        } else {
          await pool.query(
            `UPDATE messages SET is_seen = 1 WHERE chat_id = ? AND sender_role IN ('support','admin') AND is_seen = 0`,
            [chatId]
          );
          const [latestAgentMsg] = await pool.query(
            `SELECT created_at FROM messages WHERE chat_id = ? AND sender_role IN ('support','admin') AND is_seen = 1 ORDER BY created_at DESC LIMIT 1`,
            [chatId]
          );
          const resolvedSeenAt = latestAgentMsg[0]?.created_at
            ? new Date(latestAgentMsg[0].created_at).toISOString()
            : seenAt;
          console.log(`\uD83D\uDC41\uFE0F Client read agent msgs in chat ${chatId}`);
          io.to(`chat_${chatId}`).emit('messages_seen_by_client', { chatId, seenAt: resolvedSeenAt });
        }
      } catch (err) {
        console.error('Error marking messages as read:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

export const emitStatsUpdate = () => {
  if (!io) return;
  io.emit('stats_update', { ts: Date.now() });
};

export const emitNewMessage = (chatId, message, agentId = null) => {
  if (io) {
    const messageWithChatId = { ...message, chat_id: message.chat_id || chatId };

    const chatRoom = io.sockets.adapter.rooms.get(`chat_${chatId}`);
    const agentRoom = agentId ? io.sockets.adapter.rooms.get(`user_${agentId}`) : null;

    console.log(`📤 Emitting new message:`, {
      messageId: message.id,
      chatId,
      toRoom: `chat_${chatId}`,
      chatRoomSize: chatRoom ? chatRoom.size : 0,
      toAgent: agentId ? `user_${agentId}` : 'none',
      agentRoomSize: agentRoom ? agentRoom.size : 0,
      senderRole: message.sender_role
    });

    io.to(`chat_${chatId}`).emit('new_message', messageWithChatId);

    if (agentId) {
      console.log(`📤 Also emitting to agent's personal room: user_${agentId}`);
      io.to(`user_${agentId}`).emit('new_message', messageWithChatId);
    }
  }
};

export const emitChatAssigned = (agentId, chatData) => {
  if (io) {
    console.log(`📤 Emitting chat assigned to agent ${agentId}`);
    io.to(`user_${agentId}`).emit('chat_assigned', chatData);
    emitQueueUpdate({ action: 'chat_assigned', chatId: chatData.id, agentId });
  }
};

export const emitChatStatusUpdate = (chatId, status) => {
  if (io) {
    io.to(`chat_${chatId}`).emit('chat_status_update', { chatId, status });
  }
};

export const emitQueueUpdate = (queueData) => {
  if (io) {
    console.log(`📤 Broadcasting queue update to all clients:`, queueData);
    io.emit('queue_update', queueData);
  }
};

export const emitQueuePositionUpdate = (clientId, newPosition) => {
  if (io) {
    console.log(`📤 Emitting queue position update to client ${clientId}: now position ${newPosition}`);
    io.to(`user_${clientId}`).emit('queue_position_update', { position: newPosition });
  }
};

export const emitNotification = (userId, notification) => {
  if (io) {
    console.log(`🔔 Emitting notification to user_${userId}:`, notification.type, notification.message);
    io.to(`user_${userId}`).emit('new_notification', notification);
  }
};

export const emitUserStatusChange = (userData) => {
  if (io) {
    console.log(`👤 Broadcasting user status change: user ${userData.id} is now ${userData.status}`);
    io.emit('user_status_changed', {
      userId: userData.id,
      status: userData.status,
      name: userData.name,
      role: userData.role
    });
  }
};

export default {
  initializeSocket,
  getIO,
  emitNewMessage,
  emitChatAssigned,
  emitChatStatusUpdate,
  emitQueueUpdate,
  emitQueuePositionUpdate,
  emitNotification,
  emitUserStatusChange
};
