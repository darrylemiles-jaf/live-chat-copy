import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

/**
 * @param {Object} payload 
 * @returns {String} 
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE
  });
};

/**
 
  @param {String} token 
 @returns {Object} 
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 
 * @param {Object} user 
 * @returns {String} 
 */
export const generateUserToken = (user) => {
  return generateToken({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role
  });
};
