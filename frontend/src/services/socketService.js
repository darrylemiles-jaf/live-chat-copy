import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.userId = null; // Store userId for reconnection
  }

  connect(socketUrl, userId) {
    // Always update stored userId
    if (userId) {
      this.userId = userId;
    }

    if (this.socket) {
      // Socket already exists (connected or still connecting) — don't recreate it
      // But re-emit join for the personal room if we have a userId and are connected
      if (this.userId && this.socket.connected) {
        this.socket.emit('join', this.userId);
        console.log(`👤 Re-joined personal room: user_${this.userId}`);
      }
      return this.socket;
    }

    console.log(`🔌 Creating new socket connection to ${socketUrl} for user ${userId}`);

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected to chat server, socketId:', this.socket.id);
      this.isConnected = true;
      if (this.userId) {
        this.socket.emit('join', this.userId);
        console.log(`👤 Joined personal room on connect: user_${this.userId}`);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected from chat server:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error.message);
    });

    // Debug: Log ALL incoming socket events
    this.socket.onAny((eventName, ...args) => {
      console.log(`📥 Socket event received: ${eventName}`, args);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinChat(chatId) {
    if (this.socket && chatId) {
      this.socket.emit('join_chat', chatId);
    }
  }

  leaveChat(chatId) {
    if (this.socket && chatId) {
      this.socket.emit('leave_chat', chatId);
    }
  }

  sendTyping(chatId, userName) {
    if (this.socket && chatId) {
      this.socket.emit('typing', { chatId, userName });
    }
  }

  stopTyping(chatId) {
    if (this.socket && chatId) {
      this.socket.emit('stop_typing', { chatId });
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketService();
