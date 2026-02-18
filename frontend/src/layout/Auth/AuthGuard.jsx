import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ==============================|| AUTH GUARD ||============================== //

const AuthGuard = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('serviceToken');
    
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const token = localStorage.getItem('serviceToken');

  if (!token) {
    return null;
  }

  return children;
};

export default AuthGuard;
