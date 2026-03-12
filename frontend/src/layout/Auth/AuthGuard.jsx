import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isAuthenticated } from 'utils/auth';

function processUrlToken() {
  try {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    if (!tokenFromUrl) return null;

    const payload = tokenFromUrl.split('.')[1];
    if (!payload) return 'invalid';

    const decoded = JSON.parse(atob(payload));
    const now = Math.floor(Date.now() / 1000);

    if (decoded.exp && decoded.exp > now) {
      localStorage.setItem('serviceToken', tokenFromUrl);
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: decoded.id,
          email: decoded.email,
          username: decoded.username,
          name: decoded.name || decoded.username,
          role: decoded.role,
          phone: decoded.phone,
        })
      );
      console.log('✅ Token and user stored from URL:', decoded);
      return null; // no error
    } else {
      console.error('❌ Token from URL is expired');
      return 'expired';
    }
  } catch (error) {
    console.error('❌ Invalid token in URL:', error);
    return 'invalid';
  }
}

const AuthGuard = ({ children }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tokenError] = useState(() => processUrlToken());

  const userData = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const isUnauthorized = userData?.role && userData.role !== 'admin' && userData.role !== 'support';

  useEffect(() => {
    if (tokenError || isUnauthorized) {
      // Clear invalid/unauthorized credentials to prevent redirect loop
      localStorage.removeItem('serviceToken');
      localStorage.removeItem('user');
      const message =
        isUnauthorized
          ? 'You do not have permission to access this page.'
          : tokenError === 'expired'
            ? 'Your session has expired. Please log in again.'
            : 'Invalid session. Please log in again.';
      navigate('/login', { replace: true, state: { authMessage: message, authSeverity: 'warning' } });
      return;
    }

    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      searchParams.delete('token');
      setSearchParams(searchParams, { replace: true });
    }

    if (!isAuthenticated()) {
      navigate('/login', { replace: true, state: { authMessage: 'Please log in to continue.', authSeverity: 'info' } });
    }
  }, [navigate, searchParams, setSearchParams, tokenError, isUnauthorized]);

  if (tokenError || isUnauthorized || (!isAuthenticated() && !searchParams.get('token'))) {
    return null;
  }

  return children;
};

export default AuthGuard;
