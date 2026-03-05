import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRE = process.env.JWT_EXPIRE;

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
  const { id, email, ...userObj } = user;
  return jwt.sign(
    { userId: id, emailAddress: email, ...userObj },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
};
