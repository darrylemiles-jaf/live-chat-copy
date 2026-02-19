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
      socket.join(`user_${userId}`);
      console.log(`👤 User ${userId} joined their room`);
    });

    // Join chat room
    socket.on('join_chat', (chatId) => {
      socket.join(`chat_${chatId}`);
      console.log(`💬 Socket ${socket.id} joined chat_${chatId}`);
    });

    // Leave chat room
    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat_${chatId}`);
      console.log(`👋 Socket ${socket.id} left chat_${chatId}`);
    });

    // Agent typing indicator
    socket.on('typing', ({ chatId, userName }) => {
      socket.to(`chat_${chatId}`).emit('user_typing', { userName });
    });

    // Agent stopped typing
    socket.on('stop_typing', ({ chatId }) => {
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

// Emit new message to chat room and sender's user room
export const emitNewMessage = (chatId, message) => {
  if (io) {
    // Emit to chat room
    io.to(`chat_${chatId}`).emit('new_message', message);
    // Also emit to sender's user room (for first message when user hasn't joined chat room yet)
    if (message.sender_id) {
      io.to(`user_${message.sender_id}`).emit('new_message', message);
    }
  }
};

// Emit chat assignment notification to agent
export const emitChatAssigned = (agentId, chatData) => {
  if (io) {
    io.to(`user_${agentId}`).emit('chat_assigned', chatData);
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
    io.emit('queue_update', queueData);
  }
};

export default {
  initializeSocket,
  getIO,
  emitNewMessage,
  emitChatAssigned,
  emitChatStatusUpdate,
  emitQueueUpdate
};
