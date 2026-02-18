// Validation schemas for chats
export const createChatSchema = {
  client_id: {
    required: true,
    type: 'number',
    min: 1
  },
  agent_id: {
    required: false,
    type: 'number',
    min: 1
  },
  status: {
    required: false,
    type: 'string',
    enum: ['queued', 'active', 'ended']
  }
};

export const updateChatSchema = {
  agent_id: {
    required: false,
    type: 'number',
    min: 1
  },
  status: {
    required: false,
    type: 'string',
    enum: ['queued', 'active', 'ended']
  },
  started_at: {
    required: false,
    type: 'string', // Expecting ISO date string
    custom: (value) => {
      if (value && isNaN(Date.parse(value))) {
        return 'started_at must be a valid date';
      }
    }
  },
  ended_at: {
    required: false,
    type: 'string', // Expecting ISO date string
    custom: (value) => {
      if (value && isNaN(Date.parse(value))) {
        return 'ended_at must be a valid date';
      }
    }
  }
};
