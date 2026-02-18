// Validation schemas for tickets
export const createTicketSchema = {
  title: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 255,
    trim: true
  },
  description: {
    required: false,
    type: 'string',
    maxLength: 65535, // MySQL TEXT field limit
    trim: true
  },
  status: {
    required: false,
    type: 'string',
    enum: ['open', 'in_progress', 'closed']
  },
  priority: {
    required: false,
    type: 'string',
    enum: ['low', 'medium', 'high']
  }
};

export const updateTicketSchema = {
  title: {
    required: false,
    type: 'string',
    minLength: 1,
    maxLength: 255,
    trim: true
  },
  description: {
    required: false,
    type: 'string',
    maxLength: 65535,
    trim: true
  },
  status: {
    required: false,
    type: 'string',
    enum: ['open', 'in_progress', 'closed']
  },
  priority: {
    required: false,
    type: 'string',
    enum: ['low', 'medium', 'high']
  }
};
