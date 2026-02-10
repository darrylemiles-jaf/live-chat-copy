// Validation schemas for messages
export const createMessageSchema = {
  chat_id: {
    required: true,
    type: 'number',
    min: 1
  },
  sender_id: {
    required: true,
    type: 'number',
    min: 1
  },
  message: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 65535, // MySQL TEXT field limit
    trim: true
  }
};
