import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../constants/constants';

const AUTH_STORAGE_KEY = 'user';
const TOKEN_STORAGE_KEY = 'authToken';

export function useAuth() {
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;

    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (err) {
      console.warn('Error reading user from localStorage:', err);
      return null;
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return user !== null && localStorage.getItem(TOKEN_STORAGE_KEY) !== null;
  });

  const login = useCallback((userData, token = null) => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);

      if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      }

      setIsLoggedIn(true);

      return true;
    } catch (err) {
      console.error('Error during login:', err);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Set user status to 'away' before clearing session
      const token = localStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem('serviceToken');
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      const userId = parsedUser?.id;

      if (userId && token) {
        const apiVer = import.meta.env.VITE_API_VER;
        try {
          await fetch(`${API_URL}/api/${apiVer}/users/${userId}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'away' }),
            keepalive: true
          });
          console.log('✅ User status set to away on logout');
        } catch (err) {
          console.error('Failed to set away status on logout:', err);
        }
      }

      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem('serviceToken');
      setUser(null);
      setIsLoggedIn(false);

      return true;
    } catch (err) {
      console.error('Error during logout:', err);
      return false;
    }
  }, []);

  const updateUser = useCallback((updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);

      return true;
    } catch (err) {
      console.error('Error updating user:', err);
      return false;
    }
  }, [user]);

  const getToken = useCallback(() => {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }, []);

  const hasRole = useCallback((role) => {
    if (!user || !user.role) return false;
    return user.role === role;
  }, [user]);

  const hasPermission = useCallback((permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  }, [user]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === AUTH_STORAGE_KEY) {
        try {
          const newUser = e.newValue ? JSON.parse(e.newValue) : null;
          setUser(newUser);
          setIsLoggedIn(newUser !== null);
        } catch (err) {
          console.warn('Error syncing auth state:', err);
        }
      }

      if (e.key === TOKEN_STORAGE_KEY) {
        const hasToken = e.newValue !== null;
        setIsLoggedIn(hasToken && user !== null);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (err) {
        console.warn('Invalid stored user data, clearing:', err);
        logout();
      }
    } else if (!storedUser || !storedToken) {
      setUser(null);
      setIsLoggedIn(false);
    }
  }, []);

  return {
    user,
    isLoggedIn,

    login,
    logout,
    updateUser,
    getToken,

    hasRole,
    hasPermission
  };
}

export default useAuth;
