/**
 * Decode JWT token from localStorage
 * @returns {Object|null} User data from token or null
 */
export const getCurrentUser = () => {
  try {
    const token = localStorage.getItem('serviceToken');
    if (!token) return null;

    // JWT tokens are in format: header.payload.signature
    const payload = token.split('.')[1];
    if (!payload) return null;

    // Decode base64 payload
    const decodedPayload = JSON.parse(atob(payload));
    
    return {
      id: decodedPayload.id,
      email: decodedPayload.email,
      username: decodedPayload.username,
      role: decodedPayload.role,
      name: decodedPayload.name || decodedPayload.username
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Logout user by clearing token and redirecting to login
 */
export const logout = () => {
  localStorage.removeItem('serviceToken');
  window.location.href = '/login';
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('serviceToken');
};
