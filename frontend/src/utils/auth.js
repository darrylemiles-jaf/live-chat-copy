import { API_URL } from '../constants/constants';

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


export const logout = async () => {
  try {
    const user = getCurrentUser();

    // Set user status to 'away' before logging out (if user exists)
    if (user?.id) {
      const apiUrl = `${API_URL}/api/${import.meta.env.VITE_API_VER}/users/${user.id}/status`;
      const token = localStorage.getItem('serviceToken');

      // Use fetch with keepalive for reliable delivery
      try {
        await fetch(apiUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'away' }),
          keepalive: true
        });
        console.log('✅ User status set to away on logout');
      } catch (error) {
        console.error('Failed to set away status on logout:', error);
        // Continue with logout even if status update fails
      }
    }
  } catch (error) {
    console.error('Error during logout process:', error);
  } finally {
    // Always clear all token/user keys and redirect
    localStorage.removeItem('serviceToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('serviceToken');
};
