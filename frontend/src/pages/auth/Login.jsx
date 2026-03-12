import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthLogin from 'sections/auth/AuthLogin';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth';
import { useSnackbar } from 'contexts/SnackbarContext';

// ================================|| JWT - LOGIN ||================================ //

export default function Login() {
  const location = useLocation();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (isAuthenticated()) {
      window.location.href = '/portal/dashboard';
    }
  }, []);

  useEffect(() => {
    const { authMessage, authSeverity } = location.state ?? {};
    if (authMessage) {
      showSnackbar(authMessage, authSeverity ?? 'info');
    }
  }, [location.state, showSnackbar]);

  return (
    <AuthWrapper>
      <Stack spacing={3}>
        <Stack spacing={1} textAlign="center">
          <Typography variant="h1" sx={{ fontWeight: 700 }}>
            Welcome Back
          </Typography>
          <Typography variant="h5" color="textSecondary">
            Enter your credentials to continue
          </Typography>
        </Stack>
        <AuthLogin />
      </Stack>
    </AuthWrapper>
  );
}
