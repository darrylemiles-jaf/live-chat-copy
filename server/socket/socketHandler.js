import { Server } from 'socket.io';

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

    // Join user to their personal room
    socket.on('join', (userId) => {
      const roomName = `user_${userId}`;
      socket.join(roomName);
      console.log(`👤 User ${userId} joined their personal room: ${roomName} (socket: ${socket.id})`);
      // Log all rooms this socket is in
      console.log(`   📋 Socket ${socket.id} is now in rooms:`, Array.from(socket.rooms));
    });

    // Join chat room
    socket.on('join_chat', (chatId) => {
      const roomName = `chat_${chatId}`;
      socket.join(roomName);
      console.log(`💬 Socket ${socket.id} joined ${roomName}`);
      // Log all rooms this socket is in
      console.log(`   📋 Socket ${socket.id} is now in rooms:`, Array.from(socket.rooms));
    });

    // Leave chat room
    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat_${chatId}`);
      console.log(`👋 Socket ${socket.id} left chat_${chatId}`);
    });

    // Typing indicator (agent or client)
    socket.on('typing', ({ chatId, userName, role }) => {
      console.log(`⌨️ Typing event: chatId=${chatId}, userName=${userName}, role=${role}`);
      const room = `chat_${chatId}`;
      const roomSockets = io.sockets.adapter.rooms.get(room);
      console.log(`   📋 Room ${room} has ${roomSockets ? roomSockets.size : 0} sockets`);
      socket.to(room).emit('user_typing', { userName, role });
    });

    // Stopped typing
    socket.on('stop_typing', ({ chatId }) => {
      console.log(`⌨️ Stop typing: chatId=${chatId}`);
      socket.to(`chat_${chatId}`).emit('user_stop_typing');
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

// Emit new message to chat room AND the agent's personal room (fallback for when portal hasn't joined the chat room yet)
export const emitNewMessage = (chatId, message, agentId = null) => {
  if (io) {
    // Add chat_id to the message if not present (ensure consistency)
    const messageWithChatId = { ...message, chat_id: message.chat_id || chatId };

    // Get room sizes for debugging
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

    // Emit to chat room (for anyone who has the chat open)
    io.to(`chat_${chatId}`).emit('new_message', messageWithChatId);

    // Also notify the assigned agent directly via their personal room
    // This ensures they receive the message even if they haven't opened the chat yet
    if (agentId) {
      console.log(`📤 Also emitting to agent's personal room: user_${agentId}`);
      io.to(`user_${agentId}`).emit('new_message', messageWithChatId);
    }
  }
};

// Emit chat assignment notification to agent
export const emitChatAssigned = (agentId, chatData) => {
  if (io) {
    console.log(`📤 Emitting chat assigned to agent ${agentId}`);
    io.to(`user_${agentId}`).emit('chat_assigned', chatData);
    // Also broadcast queue update to all connected clients
    emitQueueUpdate({ action: 'chat_assigned', chatId: chatData.id, agentId });
  }
};

// Emit chat status update
export const emitChatStatusUpdate = (chatId, status) => {
  if (io) {
    io.to(`chat_${chatId}`).emit('chat_status_update', { chatId, status });
  }
};

// Emit queue update to all agents
export const emitQueueUpdate = (queueData) => {
  if (io) {
    console.log(`📤 Broadcasting queue update to all clients:`, queueData);
    io.emit('queue_update', queueData);
  }
};

// Emit queue position update to a specific queued client
export const emitQueuePositionUpdate = (clientId, newPosition) => {
  if (io) {
    console.log(`📤 Emitting queue position update to client ${clientId}: now position ${newPosition}`);
    io.to(`user_${clientId}`).emit('queue_position_update', { position: newPosition });
  }
};

// Emit notification to a specific user
export const emitNotification = (userId, notification) => {
  if (io) {
    console.log(`🔔 Emitting notification to user_${userId}:`, notification.type, notification.message);
    io.to(`user_${userId}`).emit('new_notification', notification);
  }
};

// Emit user status change to all connected clients
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
