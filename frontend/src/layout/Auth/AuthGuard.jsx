import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isAuthenticated } from 'utils/auth';


const AuthGuard = ({ children }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');

    if (tokenFromUrl) {
      try {
        const payload = tokenFromUrl.split('.')[1];
        if (payload) {
          const decodedPayload = JSON.parse(atob(payload));

          const currentTime = Math.floor(Date.now() / 1000);
          if (decodedPayload.exp && decodedPayload.exp > currentTime) {
            localStorage.setItem('serviceToken', tokenFromUrl);
            console.log('✅ Token stored from URL:', decodedPayload);

            searchParams.delete('token');
            setSearchParams(searchParams, { replace: true });
          } else {
            console.error('❌ Token from URL is expired');
            navigate('/401', { replace: true });
            return;
          }
        }
      } catch (error) {
        console.error('❌ Invalid token in URL:', error);
        navigate('/401', { replace: true });
        return;
      }
    }

    if (!isAuthenticated()) {
      navigate('/401', { replace: true });
    }
  }, [navigate, searchParams, setSearchParams]);

  if (!isAuthenticated()) {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      return null;
    }
  }

  return children;
};

export default AuthGuard;
