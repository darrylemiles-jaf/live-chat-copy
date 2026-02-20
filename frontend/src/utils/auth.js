/**
 
 * @returns {Object|null} User data from token or null
 */
export const getCurrentUser = () => {
  try {
    const token = localStorage.getItem('serviceToken');
    if (!token) return null;

    const payload = token.split('.')[1];
    if (!payload) return null;

    const decodedPayload = JSON.parse(atob(payload));
    
    return {
      id: decodedPayload.id,
      email: decodedPayload.email,
      username: decodedPayload.username,
      role: decodedPayload.role,
      name: decodedPayload.name || decodedPayload.username,
      phone: decodedPayload.phone
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};


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
