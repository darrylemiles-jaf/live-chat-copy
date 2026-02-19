import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(socketUrl, userId) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to chat server');
      this.isConnected = true;
      if (userId) {
        this.socket.emit('join', userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from chat server');
      this.isConnected = false;
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
