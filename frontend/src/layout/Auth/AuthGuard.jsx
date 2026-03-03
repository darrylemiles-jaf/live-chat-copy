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

  useEffect(() => {
    if (tokenError) {
      navigate('/unauthorized-access', { replace: true });
      return;
    }

    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      searchParams.delete('token');
      setSearchParams(searchParams, { replace: true });
    }

    if (!isAuthenticated()) {
      navigate('/unauthorized-access', { replace: true });
    }
  }, [navigate, searchParams, setSearchParams, tokenError]);

  if (!isAuthenticated() && !searchParams.get('token')) {
    return null;
  }

  return children;
};

export default AuthGuard;
