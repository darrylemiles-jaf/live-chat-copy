// Validation schemas for users
export const createUserSchema = {
  name: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 255,
    trim: true
  },
  username: {
    required: true,
    type: 'string',
    minLength: 3,
    maxLength: 100,
    trim: true
  },
  email: {
    required: true,
    type: 'string',
    email: true,
    maxLength: 255,
    trim: true
  },
  phone: {
    required: false,
    type: 'string',
    maxLength: 20,
    trim: true
  },
  company_name: {
    required: false,
    type: 'string',
    maxLength: 255,
    trim: true
  },
  percentage_income: {
    required: false,
    type: 'number',
    min: 0,
    max: 100
  },
  role: {
    required: false,
    type: 'string',
    enum: ['accountant', 'admin', 'user', 'manager']
  },
  referral_code: {
    required: false,
    type: 'string',
    maxLength: 50,
    trim: true
  },
  referrer_code: {
    required: false,
    type: 'string',
    maxLength: 50,
    trim: true
  },
  bank_name: {
    required: false,
    type: 'string',
    maxLength: 255,
    trim: true
  },
  bank_account_number: {
    required: false,
    type: 'string',
    maxLength: 100,
    trim: true
  },
  ewallet_name: {
    required: false,
    type: 'string',
    maxLength: 100,
    trim: true
  },
  ewallet_account_number: {
    required: false,
    type: 'string',
    maxLength: 100,
    trim: true
  },
  profile_picture: {
    required: false,
    type: 'string',
    maxLength: 500,
    trim: true
  },
  support_level: {
    required: false,
    type: 'string',
    maxLength: 50,
    trim: true
  }
};

export const updateUserSchema = {
  name: {
    required: false,
    type: 'string',
    minLength: 1,
    maxLength: 255,
    trim: true
  },
  email: {
    required: false,
    type: 'string',
    email: true,
    maxLength: 255,
    trim: true
  },
  phone: {
    required: false,
    type: 'string',
    maxLength: 20,
    trim: true
  },
  company_name: {
    required: false,
    type: 'string',
    maxLength: 255,
    trim: true
  },
  percentage_income: {
    required: false,
    type: 'number',
    min: 0,
    max: 100
  },
  role: {
    required: false,
    type: 'string',
    enum: ['accountant', 'admin', 'user', 'manager']
  },
  bank_name: {
    required: false,
    type: 'string',
    maxLength: 255,
    trim: true
  },
  bank_account_number: {
    required: false,
    type: 'string',
    maxLength: 100,
    trim: true
  },
  ewallet_name: {
    required: false,
    type: 'string',
    maxLength: 100,
    trim: true
  },
  ewallet_account_number: {
    required: false,
    type: 'string',
    maxLength: 100,
    trim: true
  },
  profile_picture: {
    required: false,
    type: 'string',
    maxLength: 500,
    trim: true
  },
  support_level: {
    required: false,
    type: 'string',
    maxLength: 50,
    trim: true
  }
};
